import type {LegalSection} from '../../layouts/LegalShell'
import {LegalShell} from '../../layouts/LegalShell'

const sections: LegalSection[] = [
    {
        id: 'scope',
        title: 'Scope of this policy',
        body: (
            <>
                <p>
                    This Privacy Policy explains how personal information is handled in the <b
                    className="font-semibold">Temple
                    Management System</b>, provided by <b className="font-semibold">Quick Solutions (PVT) Ltd</b> to
                    Buddhist temples in Sri Lanka, each on its own domain.
                </p>
                <p>
                    Each temple decides what it records about its community and is responsible for that information.
                    Quick Solutions provides and maintains the platform. Where those two roles differ, this policy
                    says so.
                </p>
            </>
        ),
    },
    {
        id: 'what-we-collect',
        title: 'What is collected',
        body: (
            <>
                <p><b className="font-semibold">Account information</b> - first and last name, nickname (where given),
                    NIC number, email address, mobile number, password (stored only as a bcrypt hash), role and account
                    status.</p>
                <p><b className="font-semibold">Temple information</b> - temple name, register code and unique system
                    identifier, address, village, district, postal code, contact details, authorised representatives,
                    registration status and the temple’s QR code.</p>
                <p><b className="font-semibold">Community records</b> - family registration details, Dana slot bookings
                    and the names attached to each session, temple-transfer records, online donation records
                    (transaction reference, date, amount, status), announcements, event and Daham Pasal records, and
                    community ideas or suggestions you submit.</p>
                <p><b className="font-semibold">Technical information</b> - sign-in times, the pages and records you
                    open, device and browser type, error reports, notification delivery status, and whether you have
                    allowed push or browser notifications.</p>
                <p><b className="font-semibold">Audit records</b> - changes to registration status, role assignments,
                    permission changes, administrative actions and temple transfers.</p>
            </>
        ),
    },
    {
        id: 'why',
        title: 'Why it is used',
        body: (
            <>
                <ul className="list-disc space-y-1.5 pl-5">
                    <li>to create, authenticate and secure accounts, and to recover access when it is lost;</li>
                    <li>to register and approve temples, and to keep temple profiles current;</li>
                    <li>to operate family registration through temple QR codes and self-service temple transfers;</li>
                    <li>to run Dana slots and bookings, including capacity limits and booking statuses;</li>
                    <li>to record and verify online donations;</li>
                    <li>to send notifications about bookings, approvals, events and announcements;</li>
                    <li>to produce the reports and audit records that authorised users are entitled to;</li>
                    <li>to keep the platform secure, prevent misuse and diagnose faults.</li>
                </ul>
                <p>
                    Only the information necessary for an approved purpose is collected. It is not used for advertising,
                    and no profile is built for marketing.
                </p>
            </>
        ),
    },
    {
        id: 'legal-basis',
        title: 'Basis for processing',
        body: (
            <>
                <p>
                    Information is processed because it is needed to provide the service a temple has asked for, to
                    meet the temple’s legitimate administrative needs for its religious, charitable and community
                    activities, because you have asked us to act on your registration request, or because the law
                    requires a record to be kept - for example, financial transaction records.
                </p>
                <p>
                    Where consent is the basis - optional notifications, or photographs of children - it may be
                    withdrawn at any time without affecting earlier processing.
                </p>
            </>
        ),
    },
    {
        id: 'visibility',
        title: 'Who can see what',
        body: (
            <>
                <p>
                    Access follows role and temple. Temple-level users are restricted to their own temple’s records;
                    access is enforced on the server, not only by what the interface shows.
                </p>
                <div className="overflow-x-auto rounded-xl border border-[#d9e3d6]">
                    <table className="w-full min-w-152 border-collapse text-[0.92rem]">
                        <thead className="bg-[#f2f7ef] text-left">
                        <tr>
                            <th scope="col" className="px-3 py-2.5 font-semibold">Record</th>
                            <th scope="col" className="px-3 py-2.5 font-semibold">Temple Admin &amp; Co-Administrator
                            </th>
                            <th scope="col" className="px-3 py-2.5 font-semibold">Committee / religious representative
                            </th>
                            <th scope="col" className="px-3 py-2.5 font-semibold">Family user</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e3e9dd]">
                        <tr>
                            <td className="px-3 py-2.5">Name, NIC, email, phone</td>
                            <td className="px-3 py-2.5">Own temple</td>
                            <td className="px-3 py-2.5">If permitted</td>
                            <td className="px-3 py-2.5">Own record</td>
                        </tr>
                        <tr>
                            <td className="px-3 py-2.5">Dana bookings and session names</td>
                            <td className="px-3 py-2.5">Own temple</td>
                            <td className="px-3 py-2.5">If permitted</td>
                            <td className="px-3 py-2.5">Own household</td>
                        </tr>
                        <tr>
                            <td className="px-3 py-2.5">Temple transfer records</td>
                            <td className="px-3 py-2.5">Own temple</td>
                            <td className="px-3 py-2.5">If permitted</td>
                            <td className="px-3 py-2.5">Own transfers</td>
                        </tr>
                        <tr>
                            <td className="px-3 py-2.5">Donation records</td>
                            <td className="px-3 py-2.5">Own temple</td>
                            <td className="px-3 py-2.5">If permitted</td>
                            <td className="px-3 py-2.5">Own donations</td>
                        </tr>
                        <tr>
                            <td className="px-3 py-2.5">Announcements and events</td>
                            <td className="px-3 py-2.5">Publish and manage</td>
                            <td className="px-3 py-2.5">If permitted</td>
                            <td className="px-3 py-2.5">View permitted</td>
                        </tr>
                        <tr>
                            <td className="px-3 py-2.5">Audit records</td>
                            <td className="px-3 py-2.5">Own temple</td>
                            <td className="px-3 py-2.5">No access by default</td>
                            <td className="px-3 py-2.5">No access</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <p>
                    The <b className="font-semibold">Super Administrator</b> does not automatically receive unrestricted
                    access to family, donation or temple records. Any such access is limited to an authorised
                    operational purpose - for example investigating a fault or misuse - and is recorded in the audit
                    history.
                </p>
            </>
        ),
    },
    {
        id: 'temple-separation',
        title: 'Separation between temples',
        body: (
            <>
                <p>
                    Each temple’s instance and records are kept separate. Users of one temple cannot view, edit, delete
                    or manage another temple’s private information without explicit authorisation, and the separation is
                    enforced by the backend rather than by the interface alone.
                </p>
                <p>
                    Public information - such as a temple’s name and contact details - is distinguished from private and
                    restricted information throughout the System.
                </p>
            </>
        ),
    },
    {
        id: 'provider-access',
        title: 'Provider access after handover',
        body: (
            <>
                <p>
                    After the System is handed over, Quick Solutions’ access to a temple’s sensitive information follows
                    the principle of least privilege and is limited to approved support work. The provider does not have
                    unrestricted routine access to temple records.
                </p>
                <p>
                    Support access, where needed, is documented and limited to the purpose for which it was granted.
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
                    Notifications about bookings, approvals, events and announcements are sent by <b
                    className="font-semibold">email,
                    SMS and mobile push or browser notification</b>, using the channels the temple has configured and
                    the
                    consent you have given. <b className="font-semibold">No WhatsApp messages are sent</b>, and your
                    mobile number is not shared with a messaging provider for that purpose.
                </p>
                <p>
                    Notification content is limited to what the recipient needs to know. Push and browser notifications
                    appear only if you allow them, and that permission can be withdrawn in your device or browser
                    settings at any time.
                </p>
            </>
        ),
    },
    {
        id: 'children',
        title: 'Children and Daham Pasal',
        body: (
            <>
                <p>
                    Daham Pasal records may include a child’s name, class, attendance and guardian contact details. They
                    are recorded by the temple with a guardian’s consent, are visible only to authorised Daham Pasal
                    staff and the child’s guardian, and are used only for the Daham Pasal programme.
                </p>
                <p>
                    Photographs or details of children are published only with a guardian’s permission, and modules that
                    process children’s information are subject to additional access restrictions.
                </p>
            </>
        ),
    },
    {
        id: 'payments',
        title: 'Online donations and payments',
        body: (
            <>
                <p>
                    Online donations are processed by an approved payment gateway. The System does not store your card
                    or bank credentials; it records the transaction reference, date, amount and status returned by the
                    provider, and confirms a donation only after server-side verification.
                </p>
                <p>
                    Transaction records are retained under the approved financial record-retention policy, and may be
                    used to answer queries about a donation or to reconcile the temple’s accounts.
                </p>
            </>
        ),
    },
    {
        id: 'sharing',
        title: 'Sharing',
        body: (
            <>
                <p>
                    Personal information is not sold. It is shared only with the temple you are associated with (and,
                    for
                    a transfer, the destination temple), with service providers who host the platform, deliver
                    notifications or process payments and who may use it only for that purpose, and with authorities
                    where the law requires it.
                </p>
            </>
        ),
    },
    {
        id: 'retention',
        title: 'How long information is kept',
        body: (
            <>
                <ul className="list-disc space-y-1.5 pl-5">
                    <li><b className="font-semibold">Active accounts</b> - for as long as you are associated with the
                        temple.
                    </li>
                    <li><b className="font-semibold">Closed accounts</b> - personal details are reduced or removed
                        within a reasonable period, while the temple’s registration, booking, donation, transfer and
                        audit records are retained for its records.
                    </li>
                    <li><b className="font-semibold">Financial records</b> - retained for the period required by the
                        approved financial record-retention policy.
                    </li>
                    <li><b className="font-semibold">Audit and technical logs</b> - retained for as long as needed for
                        accountability, security and fault-finding, then deleted.
                    </li>
                </ul>
            </>
        ),
    },
    {
        id: 'security',
        title: 'How information is protected',
        body: (
            <>
                <p>
                    Access requires authentication, and authorisation is enforced by the backend. Passwords are stored
                    with bcrypt hashing and never in plain text. Sessions are protected by time-limited tokens, traffic
                    is encrypted in transit, temple data is separated, administrative actions are logged, and backups
                    and recovery arrangements are maintained.
                </p>
                <p>
                    No system is entirely secure. If a breach affects your information, the affected temple and users
                    will be informed without undue delay.
                </p>
            </>
        ),
    },
    {
        id: 'rights',
        title: 'Your rights',
        body: (
            <>
                <p>You may ask your temple to:</p>
                <ul className="list-disc space-y-1.5 pl-5">
                    <li>show you the information held about you, and correct anything that is wrong;</li>
                    <li>give you a copy of your own account information and booking history;</li>
                    <li>close your account and remove details that need not be retained;</li>
                    <li>stop optional notifications, and record that consent has been withdrawn;</li>
                    <li>explain how a decision about your registration, booking or transfer was made.</li>
                </ul>
                <p>
                    Requests are handled by the temple’s Temple Admin or Co-Administrator; platform-level matters can be
                    raised with Quick Solutions (PVT) Ltd at contact@inquicksolutions.com or +94 11 727 5300.
                </p>
            </>
        ),
    },
    {
        id: 'language',
        title: 'Language and accessibility',
        body: (
            <>
                <p>
                    The System supports Sinhala and English, and this policy is published in both. The interface is
                    designed to be usable across desktop, tablet and mobile screens and by users with different levels
                    of digital experience.
                </p>
            </>
        ),
    },
    {
        id: 'changes',
        title: 'Changes to this policy',
        body: (
            <>
                <p>
                    This policy may be updated as the System develops. The effective date above will change and material
                    changes will be announced in the dashboard before they take effect.
                </p>
            </>
        ),
    },
]

export const PrivacyPage = () => (
    <LegalShell
        title="Privacy Policy"
        subtitle="How personal information is collected and protected in the Temple Management System - role-based access, separation between temples, provider access after handover, and the choices you have."
        updated="26 October 2026"
        sections={sections}
    />
)