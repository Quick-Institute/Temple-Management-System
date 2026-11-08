import type {UserPageProps} from "../../types";
import WelcomeBanner from "../../components/layout/WelcomeBanner";
import DashboardSections from "../../components/dashboard/DashboardSections";
import "../../components/dashboard/family-dashboard-mobile.css";

function FamilyDashboard({user}: UserPageProps) {
    return (
        <div className="family-dashboard-page flex flex-col gap-5">
            <WelcomeBanner user={user}/>
            <DashboardSections/>
        </div>
    )
}

export default FamilyDashboard