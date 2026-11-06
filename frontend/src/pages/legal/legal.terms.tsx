import type {LegalSection} from '../../layouts/LegalShell'
import {LegalShell} from '../../layouts/LegalShell'

const sections: LegalSection[] = [
    {
        id: 'agreement',
        title: 'The agreement',
        body: (
            <>
                <p>
                    These Terms and Conditions govern the use of the <b className="font-semibold">Temple Management
                    System</b> (“the System”), a platform provided by <b className="font-semibold">Quick Solutions (PVT)
                    Ltd</b> (“Quick Solutions”, “the provider”, “we”, “us”) to Buddhist temples in Sri Lanka.
                </p>
                <p>
                    Each temple receives the System as its own installation on its own domain, with its own records,
                    users and administration. The temple is operated under the responsibility of its Temple Admin, under
                    platform-level oversight by the Super Administrator.
                </p>
                <p>
                    By creating an account, or by using the System, you agree to these terms. If you do not agree, you
                    must not register or continue to use the System.
                </p>
            </>
        ),
    },
    {
        id: 'definitions',
        title: 'Definitions',
        body: (
            <>
                <ul className="list-disc space-y-1.5 pl-5">
                    <li><b className="font-semibold">Super Administrator</b> - the platform-level role held within Quick
                        Solutions, responsible for temple registration oversight and platform settings. It is separate
                        from every temple-level role.
                    </li>
                    <li><b className="font-semibold">Temple Admin</b> - the Chief Incumbent Monk of a temple, or the
                        authorised religious representative acting for that temple, holding full administrative rights
                        within that temple.
                    </li>
                    <li><b className="font-semibold">Co-Administrator</b> - a person appointed by the Temple Admin to
                        assist with temple-level administration within assigned permissions.
                    </li>
                    <li><b className="font-semibold">Temple User</b> - an authorised religious representative, committee
                        or donor-council representative, or other approved temple user.
                    </li>
                    <li><b className="font-semibold">Family User</b> - a registered family or community member
                        associated with one temple.
                    </li>
                    <li><b className="font-semibold">Temple Instance</b> - the temple’s own deployment of the System, on
                        its own domain, with its own separated data.
                    </li>
                    <li><b className="font-semibold">Dana Slot</b> - a dated morning or afternoon almsgiving session
                        published by a temple, with a defined capacity and status.
                    </li>
                </ul>
            </>
        ),
    },
    {
        id: 'eligibility',
        title: 'Who may use the System',
        body: (
            <>
                <p>
                    Administering a temple or holding a committee role requires you to be at least 18 years old and to
                    be authorised by that temple. Family accounts may be created by an adult for their own household, or
                    by the Temple Admin or Co-Administrator on the family’s behalf.
                </p>
                <p>
                    The Chief Incumbent Monk is the Temple Admin of that temple but is not, by virtue of that position,
                    the Super Administrator, and does not receive platform-level access.
                </p>
            </>
        ),
    },
    {
        id: 'accounts',
        title: 'Accounts and identity',
        body: (
            <>
                <p>
                    A person is identified in the System by their <b className="font-semibold">National Identity Card
                    (NIC) number</b>, together with their first and last name, optional nickname, email address, mobile
                    number and role. You confirm that the details you provide are true, that they belong to you, and
                    that you will keep them current.
                </p>
                <p>
                    One account is held per person. You are responsible for safeguarding your password and for all
                    activity carried out under your account, and you must tell your Temple Admin immediately if you
                    believe your account has been accessed by someone else.
                </p>
                <p>
                    Account recovery is handled through the secure recovery process on the sign-in screen, or by your
                    temple’s administrator according to its approved procedure.
                </p>
            </>
        ),
    },
    {
        id: 'temple-registration',
        title: 'Temple registration and approval',
        body: (
            <>
                <p>
                    Signing up does <b className="font-semibold">not</b> register a temple. A temple is registered
                    through the registration workflow: the Temple Admin (or authorised religious representative) submits
                    the temple’s information, and the <b className="font-semibold">Super Administrator reviews and
                    approves it</b>.
                </p>
                <p>While under review, a registration may be marked Pending, Additional Information Required, Approved
                    or Rejected. After approval, the temple receives a unique system identifier and its register code
                    (for example <span className="mono">SMB-VIH-0042</span>), and its restricted temple functions are
                    activated.</p>
                <p>
                    A temple must not be registered by a person who is not authorised by that temple, and temple
                    details must not be submitted with false or misleading information. Approval decisions and status
                    changes are recorded in the audit history.
                </p>
            </>
        ),
    },
    {
        id: 'roles',
        title: 'Roles and permissions',
        body: (
            <>
                <p>
                    Access is granted by role and enforced on the server, not merely by what the interface displays.
                    A user may access only the functions and records permitted for their role within their assigned
                    temple, and may not view or change another temple’s private data.
                </p>
                <p>
                    Only the Temple Admin may appoint or remove the Co-Administrator, and only the Temple Admin may
                    assign temple-level roles. Role assignments, permission changes and account status changes are
                    recorded in the audit history.
                </p>
            </>
        ),
    },
    {
        id: 'qr-registration',
        title: 'Temple QR codes and family self-registration',
        body: (
            <>
                <p>
                    Each temple has a unique QR code that leads to its own registration route. Scanning the code and
                    submitting the registration form creates a family account associated with <b
                    className="font-semibold">that
                    temple only</b>; the destination temple is validated by the System and cannot be changed by editing
                    the link.
                </p>
                <p>
                    Duplicate accounts are prevented: if a family already has an account, the user is guided to sign in
                    and use the temple-change function instead of registering again.
                </p>
            </>
        ),
    },
    {
        id: 'transfers',
        title: 'Changing temples (temple transfers)',
        body: (
            <>
                <p>
                    A registered Family User may change their registered temple through self-service - by selecting the
                    destination temple or scanning its QR code - without requiring approval from a Temple Admin or
                    Co-Administrator. The System validates the destination temple, updates the temple association,
                    keeps the existing account and its history, and records the change for audit.
                </p>
                <p>
                    A family account is <b className="font-semibold">not</b> deactivated merely because the family
                    moves, and a new account must not be created for the same family.
                </p>
            </>
        ),
    },
    {
        id: 'dana',
        title: 'Dana slots and bookings',
        body: (
            <>
                <p>
                    Temples publish Dana slots with a date, time range, capacity and status. Bookings are held per
                    session - a morning session and an afternoon session for each day - and each session has its own
                    capacity. Only an authenticated Family User may book.
                </p>
                <p>
                    The System checks availability and capacity on the server when a booking is saved, including when
                    several families book at the same time, and refuses bookings that exceed capacity or that
                    conflict with an existing booking. Booking statuses follow the approved workflow: Pending, Approved,
                    Rejected, Cancelled or Completed.
                </p>
                <p>
                    You may view and cancel your own bookings in line with the temple’s cancellation policy. A Temple
                    Admin or authorised Co-Administrator may not reduce a Dana slot below its confirmed booking count
                    without following the approved resolution procedure. Booking and slot changes are recorded in the
                    audit history.
                </p>
            </>
        ),
    },
    {
        id: 'donations',
        title: 'Online donations',
        body: (
            <>
                <p>
                    Where a temple enables online donations, payments are processed by an approved payment gateway. The
                    System records the transaction reference, date, amount and status, and a donation is confirmed only
                    on <b className="font-semibold">server-side verification</b> by the provider - a success message in
                    the browser alone does not confirm a donation.
                </p>
                <p>
                    Financial records are retained according to the approved financial record-retention policy.
                    Donation acknowledgements issued by the temple must match the records in the System.
                </p>
            </>
        ),
    },
    {
        id: 'content',
        title: 'Announcements, events and temple content',
        body: (
            <>
                <p>
                    Temples are responsible for the announcements, event details, Daham Pasal notices, library
                    material and images they publish. Anything requiring approval must not be published until that
                    approval has been recorded, and restricted announcements may be seen only by their intended
                    recipients.
                </p>
                <p>
                    Do not publish material you have no right to share, and obtain a guardian’s permission before
                    publishing photographs or details of children.
                </p>
            </>
        ),
    },
    {
        id: 'notifications',
        title: 'Notifications',
        body: (
            <>
                <p>
                    The System sends notifications by <b className="font-semibold">email, SMS and mobile push or
                    browser notification</b>, according to the channels your temple has configured and the consent you
                    have given. <b className="font-semibold">No WhatsApp messages are sent by the System</b>.
                </p>
                <p>
                    Notifications about bookings, approvals and changes contain only the information appropriate for
                    the recipient. Delivery depends on third-party services and may occasionally be delayed or fail;
                    failures are logged and handled under the agreed retry policy.
                </p>
            </>
        ),
    },
    {
        id: 'modules',
        title: 'Optional modules',
        body: (
            <>
                <p>
                    Functions such as Daham Pasal management, event coordination, community and volunteer management,
                    library resources and facilities maintenance are optional modules. A module is available to a temple
                    only when it has been approved and enabled for that temple, and enabling it does not by itself grant
                    access to users - access still follows roles and permissions.
                </p>
                <p>
                    Modules that process children’s information are subject to additional access restrictions and
                    guardian procedures.
                </p>
            </>
        ),
    },
    {
        id: 'language',
        title: 'Language and terminology',
        body: (
            <>
                <p>
                    The initial release supports <b className="font-semibold">Sinhala and English</b>, and users may
                    select their preferred interface language. Sinhala and English content entered by a temple is stored
                    and displayed as entered.
                </p>
                <p>
                    Buddhist religious and cultural terms follow the approved terminology list, with an English
                    explanation where needed so that the original meaning is preserved. Language selection does not
                    change a user’s permissions.
                </p>
            </>
        ),
    },
    {
        id: 'acceptable-use',
        title: 'Acceptable use',
        body: (
            <>
                <p>You agree not to:</p>
                <ul className="list-disc space-y-1.5 pl-5">
                    <li>register or claim a temple, role or account you are not authorised to hold;</li>
                    <li>access, copy or export data outside your permissions, or attempt to reach another temple’s
                        records;
                    </li>
                    <li>attempt to bypass authentication, probe the System for vulnerabilities, or interfere with its
                        operation;
                    </li>
                    <li>submit false booking, donation or transfer information;</li>
                    <li>use the System to send unsolicited messages, or for any unlawful or disrespectful purpose.</li>
                </ul>
                <p>
                    Access may be suspended or withdrawn if these rules are broken, and serious misuse may be reported
                    to the relevant authorities.
                </p>
            </>
        ),
    },
    {
        id: 'provider-access',
        title: 'Provider access and data ownership',
        body: (
            <>
                <p>
                    The records created within a temple’s instance belong to that temple. After handover, Quick
                    Solutions’ access to a temple’s sensitive information follows the principle of least privilege and
                    is
                    limited to approved support work; the provider does not have unrestricted routine access to temple
                    records. The Super Administrator’s access to private family, donation or temple records is likewise
                    restricted to explicitly authorised operational needs and is recorded in the audit history.
                </p>
                <p>
                    Each temple is responsible for the ownership, renewal and cost of its own domain and hosting,
                    unless a separate written arrangement says otherwise.
                </p>
            </>
        ),
    },
    {
        id: 'availability',
        title: 'Availability, support and changes',
        body: (
            <>
                <p>
                    We aim to keep each temple instance available at all times, but maintenance, updates, third-party
                    service outages or faults may interrupt access. Backups, recovery and monitoring arrangements apply
                    as agreed for the temple.
                </p>
                <p>
                    Support and maintenance after handover, along with performance targets, are governed by the
                    support arrangement agreed with the temple. The System will continue to develop; material changes
                    to these terms will be announced in the dashboard and reflected in the effective date above.
                </p>
            </>
        ),
    },
    {
        id: 'termination',
        title: 'Suspension and ending access',
        body: (
            <>
                <p>
                    Your temple may close or deactivate your account in line with its approved policy, and you may ask
                    it to close your account at any time. The System may restrict an account that is suspected of
                    misuse while it is investigated.
                </p>
                <p>
                    Records the temple must keep - registration and approval history, Dana bookings, donation entries,
                    transfers and audit records - may be retained after an account is closed, with personal details
                    reduced as described in the Privacy Policy.
                </p>
            </>
        ),
    },
    {
        id: 'liability',
        title: 'Liability',
        body: (
            <>
                <p>
                    The System is a management and record-keeping tool. Each temple remains responsible for its own
                    decisions, ceremonies, bookings, donations and finances, and for the content it publishes.
                </p>
                <p>
                    To the extent permitted by law, Quick Solutions is not liable for indirect or consequential loss
                    arising from use of the System, and nothing in these terms excludes liability that cannot lawfully
                    be excluded.
                </p>
            </>
        ),
    },
    {
        id: 'law',
        title: 'Governing law and contact',
        body: (
            <>
                <p>
                    These terms are governed by the laws of Sri Lanka, and the courts of Sri Lanka have jurisdiction
                    over any dispute arising from them.
                </p>
                <p>
                    Questions about these terms should first go to your temple’s Temple Admin or Co-Administrator.
                    Platform-level matters may be raised with Quick Solutions (PVT) Ltd - contact@inquicksolutions.com,
                    +94 11 727 5300, www.quicksolution.lk.
                </p>
            </>
        ),
    },
]

export const TermsPage = () => (
    <LegalShell
        title="Terms and Conditions"
        subtitle="The agreement for using the Temple Management System - temple registration and approval, roles, QR-based family registration, temple transfers, Dana bookings, online donations and the records each temple keeps."
        updated="26 October 2026"
        sections={sections}
    />
)