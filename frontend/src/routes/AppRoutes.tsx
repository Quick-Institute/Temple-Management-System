import {Navigate, Route, Routes, useParams, useSearchParams} from 'react-router-dom'
import {ForgotPasswordPage} from '../pages/auth/auth.forgot-password'
import {AuthLoginPage} from '../pages/auth/auth.login'
import {RegisterPage} from '../pages/auth/auth.register'
import {ResetPasswordPage} from '../pages/auth/auth.reset-password'
import {SocialSignInRoute} from '../pages/auth/auth.social'
import {PrivacyPage} from '../pages/legal/legal.privacy'
import {TermsPage} from '../pages/legal/legal.terms'
import {AddTemplePage} from '../pages/temple/temple.add'
import {TempleDetailsPage} from '../pages/temple/temple.details'
import {TempleListPage} from '../pages/temple/temple.list'
import {TempleModulePage} from '../pages/temple/temple.module'
import {MyTemplePage} from '../pages/temple/temple.mine'
import {ProfilePage} from '../pages/profile.page'
import {adminRoutes} from './adminRoutes'
import {authRoutes} from './authRoutes'
import {AccessDenied, RequirePermission, RequirePermissionShell} from './guards'
import {usePermissions} from '../hooks/usePermissions'
import {useAuth} from '../context/AuthContext'
import {useTemples} from '../data/templeStore'
import {AppShell} from '../layouts/AppShell'
import {assignedTempleFor, canAccessTemple, canCreateTemple, canEditTempleRecord,} from '../data/templeAccess'
/* Upstream: donation workflow and community suggestions. */
import DonationPage from '../pages/DonationPage'
import DonationSuccessPage from '../pages/DonationSuccessPage'
import SuggestionsPage from '../pages/SuggestionsPage'
import AdminSuggestionsPage from '../pages/admin/AdminSuggestionsPage'
/* Upstream portal screens. They render inside PortalLayout, which mounts our own AppShell. */
import {DashboardRoute, PlaceholderPage, PortalLayout} from './PortalLayout'
import {portalRoutes} from './portalRoutes'
import {usePortalUser} from './portalContext'
import DanaSchedulePage from '../pages/family/DanaSchedulePage'
import DanaBookingPage from '../pages/family/DanaBookingPage'
import BookingConfirmationPage from '../pages/family/BookingConfirmationPage'
import MyBookingsPage from '../pages/family/MyBookingsPage'


//User and  families pages
// Temple Admin Management Pages
import FamiliesPage from '../pages/admin/families/FamiliesPage';
import AddFamilyPage from '../pages/admin/families/AddFamilyPage';
import EditFamilyPage from '../pages/admin/families/EditFamilyPage';
import UsersRolesPage from '../pages/admin/users/UsersRolesPage';
import AddUserPage from '../pages/admin/users/AddUserPage';
import EditUserPage from '../pages/admin/users/EditUserPage';


/* Roles that only ever see their own single temple, read-only. */
const READ_ONLY_OWN_TEMPLE = ['family', 'committeeRepresentative', 'religiousRepresentative']

/**
 * /temple - the Temple Information home.
 *   Super Admin / Temple Admin -> the temple register (list).
 *   Co-Administrator           -> straight to the one temple they are assigned to, where they can
 *                                 read, update and delete it (but never create a new temple).
 *   Family / committee / religious -> the read-only "my temple" page.
 */
const TempleHomeRoute = () => {
    const {role} = usePermissions()
    const {user} = useAuth()
    const {records} = useTemples()

    if (role === 'coAdmin') {
        const assigned = assignedTempleFor(user, records)
        if (assigned) return <Navigate to={`${adminRoutes.templeInformation}/${assigned.id}`} replace/>
        return (
            <AppShell>
                <div className="card mx-auto max-w-160 p-8 text-center">
                    <h1 className="font-temple text-[1.3rem] text-sage-900">No temple assigned yet</h1>
                    <p className="mt-1 text-[0.92rem] text-ink-soft">
                        Your Co-Administrator account is not linked to a temple. Ask the Temple Admin to
                        appoint you to a temple.
                    </p>
                </div>
            </AppShell>
        )
    }

    if (READ_ONLY_OWN_TEMPLE.includes(role)) return <MyTemplePage/>
    return <TempleListPage/>
}

/**
 * /temple/:id - a single temple's details. A Co-Administrator may open only the temple they are
 * assigned to; any other id sends them back to their own temple. Read-only own-temple roles are
 * redirected to their read-only page.
 */
const TempleDetailsGuard = ({children}: { children: React.ReactNode }) => {
    const {role} = usePermissions()
    const {user} = useAuth()
    const {records, getRecord} = useTemples()
    const {id} = useParams<{ id: string }>()
    const record = id ? getRecord(id) : undefined

    if (role === 'coAdmin') {
        if (record && canAccessTemple(user, record)) return <>{children}</>
        const assigned = assignedTempleFor(user, records)
        return <Navigate
            to={assigned ? `${adminRoutes.templeInformation}/${assigned.id}` : adminRoutes.templeInformation} replace/>
    }

    if (READ_ONLY_OWN_TEMPLE.includes(role)) return <Navigate to={adminRoutes.templeInformation} replace/>
    return <>{children}</>
}

/**
 * /temple/add - the create / edit form.
 *   Creating a new temple is reserved for Super Admin / Temple Admin.
 *   Editing (?mode=edit&id=…) is allowed for anyone who may manage that specific record, so a
 *   Co-Administrator can update their assigned temple but cannot reach the create form.
 */
const TempleFormGuard = () => {
    const {role, canEdit} = usePermissions()
    const {user} = useAuth()
    const {getRecord} = useTemples()
    const [params] = useSearchParams()
    const editId = params.get('id')
    const editing = params.get('mode') === 'edit' && Boolean(editId)
    const record = editing && editId ? getRecord(editId) : undefined

    if (editing) {
        /* An edit link for a record that no longer exists lands back on Temple Information. */
        if (!record) return <Navigate to={adminRoutes.templeInformation} replace/>
        if (canEditTempleRecord(user, record)) return <AddTemplePage/>
        return <AppShell><AccessDenied permission="manageTempleInformation"/></AppShell>
    }

    if (canCreateTemple(role) && canEdit('manageTempleInformation')) return <AddTemplePage/>
    return <AppShell><AccessDenied permission="manageTempleInformation"/></AppShell>
}

/* Upstream pages take the signed-in user as a prop; these wrappers read it from AuthContext. */
const DanaScheduleRoute = () => <DanaSchedulePage user={usePortalUser()}/>
const DanaBookingRoute = () => <DanaBookingPage user={usePortalUser()}/>
const MyBookingsRoute = () => <MyBookingsPage user={usePortalUser()}/>


export const AppRoutes = () => (
    <Routes>
        <Route path={authRoutes.login} element={<AuthLoginPage/>}/>

        <Route path={authRoutes.registerParam} element={<RegisterPage/>}/>
        <Route path={authRoutes.registerRoot} element={<Navigate to={authRoutes.registerAdmin} replace/>}/>
        <Route path={authRoutes.registerCommitteeMemberAlias}
               element={<Navigate to={authRoutes.registerCommitteeMember} replace/>}/>
        <Route path={authRoutes.forgotPassword} element={<ForgotPasswordPage/>}/>
        <Route path={authRoutes.resetPassword} element={<ResetPasswordPage/>}/>

        {/* Public legal pages, linked from the sign-up consent line. */}
        <Route path={authRoutes.terms} element={<TermsPage/>}/>
        <Route path={authRoutes.privacy} element={<PrivacyPage/>}/>

        {/*
         * Social sign-in is a placeholder: the providers are not connected yet, so both buttons
         * sign in as the Temple Admin demo account and open its dashboard.
         */}
        <Route path={authRoutes.google} element={<SocialSignInRoute provider="Google"/>}/>
        <Route path={authRoutes.facebook} element={<SocialSignInRoute provider="Facebook"/>}/>

        {/* Donation Module (public) */}
        <Route path="/donation" element={<DonationPage/>}/>
        <Route path="/donation/success" element={<DonationSuccessPage/>}/>

        {/* Community Suggestions */}
        <Route path="/suggestions" element={<SuggestionsPage/>}/>
        <Route path="/admin/suggestions" element={<AdminSuggestionsPage/>}/>

        {/* ------------------------------- portal group ------------------------------- */}
        <Route element={<PortalLayout/>}>
            {/* Dashboard resolves by user type: family, temple admin or staff representative. */}
            <Route path={adminRoutes.dashboard} element={<DashboardRoute/>}/>
            <Route path={adminRoutes.profile} element={<ProfilePage/>}/>
            <Route path={adminRoutes.myFamily}
                   element={<RequirePermission
                       permission="changeRegisteredTemple"><PlaceholderPage/></RequirePermission>}/>

            {/* Dana screens (upstream), permission-checked per FR-24 to FR-29. */}
            <Route path={adminRoutes.dana}
                   element={<RequirePermission permission="viewDanaSlots"><DanaScheduleRoute/></RequirePermission>}/>
            <Route path={portalRoutes.danaBooking}
                   element={<RequirePermission permission="bookDanaSlot"><DanaBookingRoute/></RequirePermission>}/>
            <Route path={portalRoutes.danaConfirmation}
                   element={<RequirePermission
                       permission="bookDanaSlot"><BookingConfirmationPage/></RequirePermission>}/>
            <Route path={adminRoutes.myBookings}
                   element={<RequirePermission permission="viewOwnBookings"><MyBookingsRoute/></RequirePermission>}/>
            <Route path={portalRoutes.danaSchedule} element={<Navigate to={adminRoutes.dana} replace/>}/>
            <Route path="/bookings" element={<Navigate to={adminRoutes.myBookings} replace/>}/>

            {/* Upstream role portals. */}
            <Route path={portalRoutes.templeAdmin}
                   element={<Navigate to={`${portalRoutes.templeAdmin}/dashboard`} replace/>}/>
            <Route path={`${portalRoutes.templeAdmin}/dashboard`}
                   element={<DashboardRoute dashboardRole="templeAdmin"/>}/>
            <Route path={`${portalRoutes.templeAdmin}/:page`} element={<PlaceholderPage/>}/>

            <Route path={portalRoutes.coAdmin} element={<Navigate to={adminRoutes.coAdminDashboard} replace/>}/>
            <Route path={adminRoutes.coAdminDashboard} element={<DashboardRoute dashboardRole="coAdmin"/>}/>
            <Route path={`${portalRoutes.coAdmin}/:page`} element={<PlaceholderPage/>}/>

            <Route path={portalRoutes.superAdmin}
                   element={<Navigate to={`${portalRoutes.superAdmin}/dashboard`} replace/>}/>
            <Route path={`${portalRoutes.superAdmin}/dashboard`} element={<DashboardRoute/>}/>
            <Route path={`${portalRoutes.superAdmin}/:page`} element={<PlaceholderPage/>}/>
        </Route>

        {/* --------------------- screens that carry their own AppShell --------------------- */}
        <Route path={adminRoutes.templeInformation}
               element={<RequirePermissionShell
                   permission="manageTempleInformation"><TempleHomeRoute/></RequirePermissionShell>}/>
        {/* A Co-Administrator may open only their assigned temple; read-only roles are redirected. */}
        <Route path={`${adminRoutes.templeInformation}/:id`}
               element={<RequirePermissionShell permission="manageTempleInformation">
                   <TempleDetailsGuard><TempleDetailsPage/></TempleDetailsGuard>
               </RequirePermissionShell>}/>
        {/* Create is Super Admin / Temple Admin only; edit is scoped to the assigned temple. */}
        <Route path={adminRoutes.templeAdd} element={<TempleFormGuard/>}/>

        <Route path={adminRoutes.users}
               element={<RequirePermissionShell
                   permission="manageUserRoles"><UsersRolesPage/></RequirePermissionShell>}/>

        <Route path={adminRoutes.events}
               element={<RequirePermissionShell permission="manageTempleRecords"><TempleModulePage
                   module="events"/></RequirePermissionShell>}/>
        <Route path={adminRoutes.announcements}
               element={<RequirePermissionShell permission="manageAnnouncements"><TempleModulePage
                   module="announcements"/></RequirePermissionShell>}/>
        <Route path={adminRoutes.families}
               element={<RequirePermissionShell
                   permission="registerFamilyQr"><FamiliesPage/></RequirePermissionShell>}/>
        <Route path={adminRoutes.donations}
               element={<RequirePermissionShell permission="viewDonations"><TempleModulePage
                   module="donations"/></RequirePermissionShell>}/>
        <Route path={adminRoutes.reports}
               element={<RequirePermissionShell permission="viewTempleAudit"><TempleModulePage
                   module="reports"/></RequirePermissionShell>}/>
        <Route path={adminRoutes.settings}
               element={<RequirePermissionShell permission="manageOptionalModules"><TempleModulePage module="settings"/></RequirePermissionShell>}/>
        <Route path="/temple-registration"
               element={<RequirePermissionShell permission="manageRegistrationStatus"><TempleModulePage
                   module="families"/></RequirePermissionShell>}/>


        {/* Dayaka Families Management Routes */}
        <Route path="/families" element={<RequirePermissionShell
            permission="registerFamilyQr"><FamiliesPage/></RequirePermissionShell>}/>
        <Route path="/families/add" element={<RequirePermissionShell
            permission="registerFamilyQr"><AddFamilyPage/></RequirePermissionShell>}/>
        <Route path="/families/edit/:id" element={<RequirePermissionShell
            permission="registerFamilyQr"><EditFamilyPage/></RequirePermissionShell>}/>
        <Route path="/admin/families" element={<RequirePermissionShell
            permission="registerFamilyQr"><FamiliesPage/></RequirePermissionShell>}/>
        <Route path="/admin/families/add" element={<RequirePermissionShell
            permission="registerFamilyQr"><AddFamilyPage/></RequirePermissionShell>}/>
        <Route path="/admin/families/edit/:id" element={<RequirePermissionShell
            permission="registerFamilyQr"><EditFamilyPage/></RequirePermissionShell>}/>

        {/* Committee Users & Roles Governance Routes */}
        <Route path="/users-roles" element={<RequirePermissionShell
            permission="manageUserRoles"><UsersRolesPage/></RequirePermissionShell>}/>
        <Route path="/add-user"
               element={<RequirePermissionShell permission="manageUserRoles"><AddUserPage/></RequirePermissionShell>}/>
        <Route path="/users/add"
               element={<RequirePermissionShell permission="manageUserRoles"><AddUserPage/></RequirePermissionShell>}/>
        <Route path="/users/edit/:id"
               element={<RequirePermissionShell permission="manageUserRoles"><EditUserPage/></RequirePermissionShell>}/>
        <Route path="/admin/users" element={<RequirePermissionShell
            permission="manageUserRoles"><UsersRolesPage/></RequirePermissionShell>}/>
        <Route path="/admin/users/add"
               element={<RequirePermissionShell permission="manageUserRoles"><AddUserPage/></RequirePermissionShell>}/>
        <Route path="/admin/users/edit/:id"
               element={<RequirePermissionShell permission="manageUserRoles"><EditUserPage/></RequirePermissionShell>}/>
        <Route path="/users" element={<RequirePermissionShell
            permission="manageUserRoles"><UsersRolesPage/></RequirePermissionShell>}/>

        <Route path="/" element={<Navigate to={authRoutes.login} replace/>}/>
        <Route path="*" element={<Navigate to={adminRoutes.dashboard} replace/>}/>
    </Routes>
)