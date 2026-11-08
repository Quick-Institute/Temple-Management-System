import type {LegalDocSet} from './types'

export const privacyDoc: LegalDocSet = {
    en: {
        title: 'Privacy Policy',
        subtitle: 'How personal information is collected and protected in the Temple Management System - role-based access, separation between temples, provider access after handover, and the choices you have.',
        updated: '26 October 2026',
        sections: [
            {
                id: 'scope',
                title: 'Scope of this policy',
                blocks: [
                    {
                        kind: 'p',
                        text: 'This Privacy Policy explains how personal information is handled in the **Temple Management System**, provided by **Quick Solutions (PVT) Ltd** to Buddhist temples in Sri Lanka, each on its own domain.',
                    },
                    {
                        kind: 'p',
                        text: 'Each temple decides what it records about its community and is responsible for that information. Quick Solutions provides and maintains the platform. Where those two roles differ, this policy says so.',
                    },
                ],
            },
            {
                id: 'what-we-collect',
                title: 'What is collected',
                blocks: [
                    {
                        kind: 'p',
                        text: '**Account information** - first and last name, nickname (where given), NIC number, email address, mobile number, password (stored only as a bcrypt hash), role and account status.',
                    },
                    {
                        kind: 'p',
                        text: '**Temple information** - temple name, register code and unique system identifier, address, village, district, postal code, contact details, authorised representatives, registration status and the temple\u2019s QR code.',
                    },
                    {
                        kind: 'p',
                        text: '**Community records** - family registration details, Dana slot bookings and the names attached to each session, temple-transfer records, online donation records (transaction reference, date, amount, status), announcements, event and Daham Pasal records, and community ideas or suggestions you submit.',
                    },
                    {
                        kind: 'p',
                        text: '**Technical information** - sign-in times, the pages and records you open, device and browser type, error reports, notification delivery status, and whether you have allowed push or browser notifications.',
                    },
                    {
                        kind: 'p',
                        text: '**Audit records** - changes to registration status, role assignments, permission changes, administrative actions and temple transfers.',
                    },
                ],
            },
            {
                id: 'why',
                title: 'Why it is used',
                blocks: [
                    {
                        kind: 'list',
                        items: [
                            'to create, authenticate and secure accounts, and to recover access when it is lost;',
                            'to register and approve temples, and to keep temple profiles current;',
                            'to operate family registration through temple QR codes and self-service temple transfers;',
                            'to run Dana slots and bookings, including capacity limits and booking statuses;',
                            'to record and verify online donations;',
                            'to send notifications about bookings, approvals, events and announcements;',
                            'to produce the reports and audit records that authorised users are entitled to;',
                            'to keep the platform secure, prevent misuse and diagnose faults.',
                        ],
                    },
                    {
                        kind: 'p',
                        text: 'Only the information necessary for an approved purpose is collected. It is not used for advertising, and no profile is built for marketing.',
                    },
                ],
            },
            {
                id: 'legal-basis',
                title: 'Basis for processing',
                blocks: [
                    {
                        kind: 'p',
                        text: 'Information is processed because it is needed to provide the service a temple has asked for, to meet the temple\u2019s legitimate administrative needs for its religious, charitable and community activities, because you have asked us to act on your registration request, or because the law requires a record to be kept - for example, financial transaction records.',
                    },
                    {
                        kind: 'p',
                        text: 'Where consent is the basis - optional notifications, or photographs of children - it may be withdrawn at any time without affecting earlier processing.',
                    },
                ],
            },
            {
                id: 'visibility',
                title: 'Who can see what',
                blocks: [
                    {
                        kind: 'p',
                        text: 'Access follows role and temple. Temple-level users are restricted to their own temple\u2019s records; access is enforced on the server, not only by what the interface shows.',
                    },
                    {
                        kind: 'table',
                        head: ['Record', 'Temple Admin & Co-Administrator', 'Committee / religious representative', 'Family user'],
                        rows: [
                            ['Name, NIC, email, phone', 'Own temple', 'If permitted', 'Own record'],
                            ['Dana bookings and session names', 'Own temple', 'If permitted', 'Own household'],
                            ['Temple transfer records', 'Own temple', 'If permitted', 'Own transfers'],
                            ['Donation records', 'Own temple', 'If permitted', 'Own donations'],
                            ['Announcements and events', 'Publish and manage', 'If permitted', 'View permitted'],
                            ['Audit records', 'Own temple', 'No access by default', 'No access'],
                        ],
                    },
                    {
                        kind: 'p',
                        text: 'The **Super Administrator** does not automatically receive unrestricted access to family, donation or temple records. Any such access is limited to an authorised operational purpose - for example investigating a fault or misuse - and is recorded in the audit history.',
                    },
                ],
            },
            {
                id: 'temple-separation',
                title: 'Separation between temples',
                blocks: [
                    {
                        kind: 'p',
                        text: 'Each temple\u2019s instance and records are kept separate. Users of one temple cannot view, edit, delete or manage another temple\u2019s private information without explicit authorisation, and the separation is enforced by the backend rather than by the interface alone.',
                    },
                    {
                        kind: 'p',
                        text: 'Public information - such as a temple\u2019s name and contact details - is distinguished from private and restricted information throughout the System.',
                    },
                ],
            },
            {
                id: 'provider-access',
                title: 'Provider access after handover',
                blocks: [
                    {
                        kind: 'p',
                        text: 'After the System is handed over, Quick Solutions\u2019 access to a temple\u2019s sensitive information follows the principle of least privilege and is limited to approved support work. The provider does not have unrestricted routine access to temple records.',
                    },
                    {
                        kind: 'p',
                        text: 'Support access, where needed, is documented and limited to the purpose for which it was granted.',
                    },
                ],
            },
            {
                id: 'notifications',
                title: 'Notifications',
                blocks: [
                    {
                        kind: 'p',
                        text: 'Notifications about bookings, approvals, events and announcements are sent by **email, SMS and mobile push or browser notification**, using the channels the temple has configured and the consent you have given. **No WhatsApp messages are sent**, and your mobile number is not shared with a messaging provider for that purpose.',
                    },
                    {
                        kind: 'p',
                        text: 'Notification content is limited to what the recipient needs to know. Push and browser notifications appear only if you allow them, and that permission can be withdrawn in your device or browser settings at any time.',
                    },
                ],
            },
            {
                id: 'children',
                title: 'Children and Daham Pasal',
                blocks: [
                    {
                        kind: 'p',
                        text: 'Daham Pasal records may include a child\u2019s name, class, attendance and guardian contact details. They are recorded by the temple with a guardian\u2019s consent, are visible only to authorised Daham Pasal staff and the child\u2019s guardian, and are used only for the Daham Pasal programme.',
                    },
                    {
                        kind: 'p',
                        text: 'Photographs or details of children are published only with a guardian\u2019s permission, and modules that process children\u2019s information are subject to additional access restrictions.',
                    },
                ],
            },
            {
                id: 'payments',
                title: 'Online donations and payments',
                blocks: [
                    {
                        kind: 'p',
                        text: 'Online donations are processed by an approved payment gateway. The System does not store your card or bank credentials; it records the transaction reference, date, amount and status returned by the provider, and confirms a donation only after server-side verification.',
                    },
                    {
                        kind: 'p',
                        text: 'Transaction records are retained under the approved financial record-retention policy, and may be used to answer queries about a donation or to reconcile the temple\u2019s accounts.',
                    },
                ],
            },
            {
                id: 'sharing',
                title: 'Sharing',
                blocks: [
                    {
                        kind: 'p',
                        text: 'Personal information is not sold. It is shared only with the temple you are associated with (and, for a transfer, the destination temple), with service providers who host the platform, deliver notifications or process payments and who may use it only for that purpose, and with authorities where the law requires it.',
                    },
                ],
            },
            {
                id: 'retention',
                title: 'How long information is kept',
                blocks: [
                    {
                        kind: 'list',
                        items: [
                            '**Active accounts** - for as long as you are associated with the temple.',
                            '**Closed accounts** - personal details are reduced or removed within a reasonable period, while the temple\u2019s registration, booking, donation, transfer and audit records are retained for its records.',
                            '**Financial records** - retained for the period required by the approved financial record-retention policy.',
                            '**Audit and technical logs** - retained for as long as needed for accountability, security and fault-finding, then deleted.',
                        ],
                    },
                ],
            },
            {
                id: 'security',
                title: 'How information is protected',
                blocks: [
                    {
                        kind: 'p',
                        text: 'Access requires authentication, and authorisation is enforced by the backend. Passwords are stored with bcrypt hashing and never in plain text. Sessions are protected by time-limited tokens, traffic is encrypted in transit, temple data is separated, administrative actions are logged, and backups and recovery arrangements are maintained.',
                    },
                    {
                        kind: 'p',
                        text: 'No system is entirely secure. If a breach affects your information, the affected temple and users will be informed without undue delay.',
                    },
                ],
            },
            {
                id: 'rights',
                title: 'Your rights',
                blocks: [
                    {kind: 'p', text: 'You may ask your temple to:'},
                    {
                        kind: 'list',
                        items: [
                            'show you the information held about you, and correct anything that is wrong;',
                            'give you a copy of your own account information and booking history;',
                            'close your account and remove details that need not be retained;',
                            'stop optional notifications, and record that consent has been withdrawn;',
                            'explain how a decision about your registration, booking or transfer was made.',
                        ],
                    },
                    {
                        kind: 'p',
                        text: 'Requests are handled by the temple\u2019s Temple Admin or Co-Administrator; platform-level matters can be raised with Quick Solutions (PVT) Ltd at `contact@inquicksolutions.com` or `+94 11 727 5300`.',
                    },
                ],
            },
            {
                id: 'language',
                title: 'Language and accessibility',
                blocks: [
                    {
                        kind: 'p',
                        text: 'The System supports Sinhala and English, and this policy is published in both. The interface is designed to be usable across desktop, tablet and mobile screens and by users with different levels of digital experience.',
                    },
                ],
            },
            {
                id: 'changes',
                title: 'Changes to this policy',
                blocks: [
                    {
                        kind: 'p',
                        text: 'This policy may be updated as the System develops. The effective date above will change and material changes will be announced in the dashboard before they take effect.',
                    },
                ],
            },
        ],
    },

    si: {
        title: 'පෞද්ගලිකත්ව ප්‍රතිපත්තිය',
        subtitle: 'විහාර කළමනාකරණ පද්ධතියේ පෞද්ගලික තොරතුරු රැස් කරන ආකාරය සහ ඒවා ආරක්ෂා කරන ආකාරය - භූමිකාව අනුව ප්‍රවේශය, විහාර අතර වෙන්වීම, භාරදීමෙන් පසු සපයන්නාගේ ප්‍රවේශය සහ ඔබට ඇති තේරීම්.',
        updated: '2026 ඔක්තෝබර් 26',
        sections: [
            {
                id: 'scope',
                title: 'මෙම ප්‍රතිපත්තියේ විෂය පථය',
                blocks: [
                    {
                        kind: 'p',
                        text: 'මෙම පෞද්ගලිකත්ව ප්‍රතිපත්තිය පැහැදිලි කරන්නේ ශ්‍රී ලංකාවේ බෞද්ධ විහාරස්ථාන සඳහා **Quick Solutions (PVT) Ltd** විසින් සපයන, එක් එක් විහාරයට එහිම වෙබ් ලිපිනයක් මත ලබා දෙන **විහාර කළමනාකරණ පද්ධතියේ** පෞද්ගලික තොරතුරු හසුරුවන ආකාරයයි.',
                    },
                    {
                        kind: 'p',
                        text: 'සෑම විහාරයක්ම තම ප්‍රජාව පිළිබඳ කුමන තොරතුරු සටහන් කරන්නේද යන්න තීරණය කරන අතර එම තොරතුරු සඳහා වගකීම දරයි. Quick Solutions විසින් වේදිකාව සපයා නඩත්තු කරයි. එම භූමිකා දෙක වෙනස් වන තැන මෙම ප්‍රතිපත්තිය එය පැහැදිලි කරයි.',
                    },
                ],
            },
            {
                id: 'what-we-collect',
                title: 'රැස් කරන තොරතුරු',
                blocks: [
                    {
                        kind: 'p',
                        text: '**ගිණුම් තොරතුරු** - මුල් නම සහ වාසගම, අවශ්‍ය නම් අන්වර්ථ නාමය, ජාතික හැඳුනුම්පත් අංකය, ඊමේල් ලිපිනය, ජංගම දුරකථන අංකය, මුරපදය (bcrypt hash එකක් ලෙස පමණක් ගබඩා කෙරේ), භූමිකාව සහ ගිණුමේ තත්ත්වය.',
                    },
                    {
                        kind: 'p',
                        text: '**විහාර තොරතුරු** - විහාරයේ නම, ලේඛන කේතය සහ පද්ධතියේ අනන්‍ය හැඳුනුම, ලිපිනය, ග්‍රාමය, දිස්ත්‍රික්කය, තැපැල් කේතය, සම්බන්ධතා තොරතුරු, බලයලත් නියෝජිතයින්, ලියාපදිංචි තත්ත්වය සහ විහාරයේ QR කේතය.',
                    },
                    {
                        kind: 'p',
                        text: '**ප්‍රජා වාර්තා** - පවුල් ලියාපදිංචි විස්තර, දාන වෙන් කිරීම් සහ එක් එක් වාරයට අදාළ නම්, විහාර මාරු කිරීමේ වාර්තා, අන්තර්ජාල පරිත්‍යාග වාර්තා (ගනුදෙනු යොමු අංකය, දිනය, මුදල, තත්ත්වය), නිවේදන, උත්සව හා දහම් පාසල් වාර්තා, සහ ඔබ ඉදිරිපත් කරන ප්‍රජා අදහස් හෝ යෝජනා.',
                    },
                    {
                        kind: 'p',
                        text: '**තාක්ෂණික තොරතුරු** - පිවිසුම් වේලාවන්, ඔබ විවෘත කරන පිටු සහ වාර්තා, උපාංගයේ සහ බ්‍රව්සරයේ වර්ගය, දෝෂ වාර්තා, දැනුම්දීම් බෙදාහැරීමේ තත්ත්වය, සහ ඔබ push හෝ බ්‍රව්සර් දැනුම්දීම් සඳහා අවසර දී ඇත්ද යන්න.',
                    },
                    {
                        kind: 'p',
                        text: '**විගණන වාර්තා** - ලියාපදිංචි තත්ත්වයේ වෙනස්කම්, භූමිකා පැවරීම්, අවසර වෙනස්කම්, පරිපාලන ක්‍රියා සහ විහාර මාරු කිරීම්.',
                    },
                ],
            },
            {
                id: 'why',
                title: 'භාවිත කරන අරමුණු',
                blocks: [
                    {
                        kind: 'list',
                        items: [
                            'ගිණුම් සෑදීමට, තහවුරු කිරීමට සහ ආරක්ෂා කිරීමට, අහිමි වූ විට ප්‍රවේශය යළි ලබා ගැනීමට;',
                            'විහාර ලියාපදිංචි කර අනුමත කිරීමට, විහාර පැතිකඩ යාවත්කාලීනව තබා ගැනීමට;',
                            'විහාර QR කේත හරහා පවුල් ලියාපදිංචිය සහ ස්වයං සේවා විහාර මාරු කිරීම් ක්‍රියාත්මක කිරීමට;',
                            'දාන වේලාවන් සහ වෙන් කිරීම්, ධාරිතා සීමා සහ වෙන් කිරීම් තත්ත්ව සමඟ පවත්වාගෙන යාමට;',
                            'අන්තර්ජාල පරිත්‍යාග සටහන් කර තහවුරු කිරීමට;',
                            'වෙන් කිරීම්, අනුමැතීන්, උත්සව සහ නිවේදන පිළිබඳ දැනුම්දීම් යැවීමට;',
                            'බලයලත් පරිශීලකයින්ට හිමි වාර්තා සහ විගණන වාර්තා සකස් කිරීමට;',
                            'වේදිකාව ආරක්ෂිතව තබා ගැනීමට, අනිසි භාවිතය වැළැක්වීමට සහ දෝෂ හඳුනා ගැනීමට.',
                        ],
                    },
                    {
                        kind: 'p',
                        text: 'රැස් කරන්නේ අනුමත අරමුණක් සඳහා අවශ්‍ය තොරතුරු පමණි. ඒවා වෙළඳ දැන්වීම් සඳහා භාවිත නොකරන අතර අලෙවිකරණය සඳහා පැතිකඩක් නිර්මාණය නොකෙරේ.',
                    },
                ],
            },
            {
                id: 'legal-basis',
                title: 'සැකසීමට පදනම',
                blocks: [
                    {
                        kind: 'p',
                        text: 'තොරතුරු සැකසෙන්නේ විහාරයක් ඉල්ලා ඇති සේවාව සැපයීමට එය අවශ්‍ය නිසා, විහාරයේ ආගමික, පරිත්‍යාග සහ ප්‍රජා කටයුතු සඳහා එහි නීත්‍යානුකූල පරිපාලන අවශ්‍යතා සපුරාලීමට, ඔබ ඔබේ ලියාපදිංචි ඉල්ලීම මත ක්‍රියා කරන ලෙස ඉල්ලා ඇති නිසා, නැතහොත් වාර්තාවක් තබා ගැනීමට නීතිය බල කරන නිසා - උදාහරණයක් ලෙස මූල්‍ය ගනුදෙනු වාර්තා.',
                    },
                    {
                        kind: 'p',
                        text: 'අවසරය පදනම වන තැන - අවශ්‍ය නොවන දැනුම්දීම් හෝ ළමුන්ගේ ඡායාරූප - කලින් සිදු වූ සැකසීමට බලපෑමක් නොවන පරිදි එය ඕනෑම වේලාවක ඉවත් කර ගත හැක.',
                    },
                ],
            },
            {
                id: 'visibility',
                title: 'කවුරුන් කුමක් දකින්නේද',
                blocks: [
                    {
                        kind: 'p',
                        text: 'ප්‍රවේශය භූමිකාව සහ විහාරය අනුව තීරණය වේ. විහාර මට්ටමේ පරිශීලකයින් තමන්ගේ විහාරයේ වාර්තා වලට පමණක් සීමා වේ; ප්‍රවේශය බලාත්මක කරන්නේ අතුරුමුහුණත පෙන්වන දේ පමණක් නොව සේවාදායකය මගිනි.',
                    },
                    {
                        kind: 'table',
                        head: ['වාර්තාව', 'විහාර පාලක සහ සහ-පරිපාලක', 'කාරක සභික / ආගමික නියෝජිත', 'පවුල් පරිශීලක'],
                        rows: [
                            ['නම, ජා.හැ. අංකය, ඊමේල්, දුරකථන', 'තම විහාරය', 'අවසර දී ඇත්නම්', 'තම වාර්තාව'],
                            ['දාන වෙන් කිරීම් සහ වාරයේ නම්', 'තම විහාරය', 'අවසර දී ඇත්නම්', 'තම ගෘහය'],
                            ['විහාර මාරු කිරීමේ වාර්තා', 'තම විහාරය', 'අවසර දී ඇත්නම්', 'තම මාරු කිරීම්'],
                            ['පරිත්‍යාග වාර්තා', 'තම විහාරය', 'අවසර දී ඇත්නම්', 'තම පරිත්‍යාග'],
                            ['නිවේදන සහ උත්සව', 'ප්‍රකාශ කර කළමනාකරණය කරයි', 'අවසර දී ඇත්නම්', 'අවසර දී ඇති දේ පමණක්'],
                            ['විගණන වාර්තා', 'තම විහාරය', 'පෙරනිමියෙන් ප්‍රවේශයක් නැත', 'ප්‍රවේශයක් නැත'],
                        ],
                    },
                    {
                        kind: 'p',
                        text: '**ප්‍රධාන පරිපාලක** ට පවුල්, පරිත්‍යාග හෝ විහාර වාර්තා සඳහා ස්වයංක්‍රීයව අසීමිත ප්‍රවේශයක් නොලැබේ. එවැනි ප්‍රවේශයක් ලැබෙන්නේ බලයලත් ක්‍රියාකාරී අරමුණකට පමණි - උදාහරණයක් ලෙස දෝෂයක් හෝ අනිසි භාවිතයක් පරීක්ෂා කිරීම - සහ එය විගණන ඉතිහාසයේ සටහන් වේ.',
                    },
                ],
            },
            {
                id: 'temple-separation',
                title: 'විහාර අතර වෙන්වීම',
                blocks: [
                    {
                        kind: 'p',
                        text: 'සෑම විහාරයකම පද්ධතිය සහ වාර්තා වෙන්ව පවත්වා ගැනීම සිදු වේ. එක් විහාරයක පරිශීලකයින්ට පැහැදිලි අවසරයක් නොමැතිව වෙනත් විහාරයක පෞද්ගලික තොරතුරු බැලීමට, සංස්කරණය කිරීමට, මැකීමට හෝ කළමනාකරණය කිරීමට නොහැකි අතර, එම වෙන්වීම බලාත්මක කරන්නේ අතුරුමුහුණත පමණක් නොව පසුපස පද්ධතිය මගිනි.',
                    },
                    {
                        kind: 'p',
                        text: 'පොදු තොරතුරු - උදාහරණයක් ලෙස විහාරයේ නම සහ සම්බන්ධතා තොරතුරු - පද්ධතිය පුරාම පෞද්ගලික හා සීමිත තොරතුරු වලින් වෙන් කර දැක්වේ.',
                    },
                ],
            },
            {
                id: 'provider-access',
                title: 'භාරදීමෙන් පසු සපයන්නාගේ ප්‍රවේශය',
                blocks: [
                    {
                        kind: 'p',
                        text: 'පද්ධතිය භාරදීමෙන් පසු, විහාරයක සංවේදී තොරතුරු සඳහා Quick Solutions හි ප්‍රවේශය අවම වරප්‍රසාද මූලධර්මය අනුව ක්‍රියා කරන අතර අනුමත සහාය කටයුතු වලට පමණක් සීමා වේ. සපයන්නාට විහාර වාර්තා සඳහා දෛනික අසීමිත ප්‍රවේශයක් නොමැත.',
                    },
                    {
                        kind: 'p',
                        text: 'අවශ්‍ය විටෙක සහාය ප්‍රවේශය ලේඛනගත කරනු ලබන අතර එය ලබා දුන් අරමුණට පමණක් සීමා වේ.',
                    },
                ],
            },
            {
                id: 'notifications',
                title: 'දැනුම්දීම්',
                blocks: [
                    {
                        kind: 'p',
                        text: 'වෙන් කිරීම්, අනුමැතීන්, උත්සව සහ නිවේදන පිළිබඳ දැනුම්දීම් **ඊමේල්, කෙටි පණිවිඩ (SMS) සහ ජංගම push හෝ බ්‍රව්සර් දැනුම්දීම්** මගින්, විහාරය වින්‍යාස කර ඇති නාලිකා සහ ඔබ දී ඇති අවසරය අනුව යවනු ලැබේ. **WhatsApp පණිවිඩ නොයවනු ලැබේ**, එම අරමුණ සඳහා ඔබේ ජංගම අංකය පණිවිඩ සේවා සපයන්නෙකු සමඟ බෙදා නොගැනේ.',
                    },
                    {
                        kind: 'p',
                        text: 'දැනුම්දීම්වල අන්තර්ගතය ලබන්නා දැනගත යුතු දේට පමණක් සීමා වේ. Push සහ බ්‍රව්සර් දැනුම්දීම් පෙන්වන්නේ ඔබ අවසර දුන්නොත් පමණක් වන අතර එම අවසරය ඕනෑම වේලාවක ඔබේ උපාංග හෝ බ්‍රව්සර් සැකසුම් වලින් ඉවත් කර ගත හැක.',
                    },
                ],
            },
            {
                id: 'children',
                title: 'ළමුන් සහ දහම් පාසල',
                blocks: [
                    {
                        kind: 'p',
                        text: 'දහම් පාසල් වාර්තා වල ළමයෙකුගේ නම, පන්තිය, පැමිණීම සහ භාරකරුගේ සම්බන්ධතා තොරතුරු ඇතුළත් විය හැක. ඒවා විහාරය විසින් භාරකරුගේ අවසරය සහිතව සටහන් කරන අතර බලයලත් දහම් පාසල් කාර්ය මණ්ඩලයට සහ ළමයාගේ භාරකරුට පමණක් දිස්වේ, භාවිත වන්නේ දහම් පාසල් වැඩසටහන සඳහා පමණි.',
                    },
                    {
                        kind: 'p',
                        text: 'ළමුන්ගේ ඡායාරූප හෝ විස්තර ප්‍රකාශ කරන්නේ භාරකරුගේ අවසරය ඇතිව පමණක් වන අතර ළමුන්ගේ තොරතුරු සැකසෙන මොඩියුල අමතර ප්‍රවේශ සීමා වලට යටත් වේ.',
                    },
                ],
            },
            {
                id: 'payments',
                title: 'අන්තර්ජාල පරිත්‍යාග සහ ගෙවීම්',
                blocks: [
                    {
                        kind: 'p',
                        text: 'අන්තර්ජාල පරිත්‍යාග සකසන්නේ අනුමත ගෙවීම් ද්වාරයක් මගිනි. පද්ධතිය ඔබේ කාඩ්පත් හෝ බැංකු තොරතුරු ගබඩා නොකරයි; එය සපයන්නා ලබා දෙන ගනුදෙනු යොමු අංකය, දිනය, මුදල සහ තත්ත්වය සටහන් කරන අතර සේවාදායකය මගින් තහවුරු කිරීමෙන් පසුව පමණක් පරිත්‍යාගය තහවුරු කරයි.',
                    },
                    {
                        kind: 'p',
                        text: 'ගනුදෙනු වාර්තා අනුමත මූල්‍ය වාර්තා රඳවා ගැනීමේ ප්‍රතිපත්තිය යටතේ රඳවා ගන්නා අතර පරිත්‍යාගයක් පිළිබඳ විමසුම්වලට පිළිතුරු දීමට හෝ විහාරයේ ගිණුම් සමපාත කිරීමට භාවිත කළ හැක.',
                    },
                ],
            },
            {
                id: 'sharing',
                title: 'බෙදා ගැනීම',
                blocks: [
                    {
                        kind: 'p',
                        text: 'පෞද්ගලික තොරතුරු විකුණන්නේ නැත. ඒවා බෙදා ගන්නේ ඔබ සම්බන්ධ වී ඇති විහාරය සමඟ (මාරු කිරීමකදී ගමනාන්ත විහාරය සමඟද), වේදිකාව සත්කාරකත්වය දෙන, දැනුම්දීම් බෙදාහරින හෝ ගෙවීම් සකසන සේවා සපයන්නන් සමඟ - ඔවුන්ට එය එම අරමුණට පමණක් භාවිත කළ හැකි අයුරින් - සහ නීතිය බල කරන තැන බලධාරීන් සමඟ පමණි.',
                    },
                ],
            },
            {
                id: 'retention',
                title: 'තොරතුරු කොපමණ කලක් තබා ගනීද',
                blocks: [
                    {
                        kind: 'list',
                        items: [
                            '**සක්‍රීය ගිණුම්** - ඔබ විහාරය සමඟ සම්බන්ධ වී සිටින තාක් කල්.',
                            '**වසා දැමූ ගිණුම්** - පෞද්ගලික විස්තර සාධාරණ කාලයක් තුළ අඩු කර හෝ ඉවත් කරන අතර, විහාරයේ ලියාපදිංචි, වෙන් කිරීම්, පරිත්‍යාග, මාරු කිරීම් සහ විගණන වාර්තා එහි වාර්තා සඳහා රඳවා ගැනේ.',
                            '**මූල්‍ය වාර්තා** - අනුමත මූල්‍ය වාර්තා රඳවා ගැනීමේ ප්‍රතිපත්තිය අවශ්‍ය කරන කාලය තුළ රඳවා ගැනේ.',
                            '**විගණන සහ තාක්ෂණික ලඝු-සටහන්** - වගකීම, ආරක්ෂාව සහ දෝෂ හඳුනා ගැනීම සඳහා අවශ්‍ය තාක් කල් රඳවා ගෙන පසුව මකා දමනු ලැබේ.',
                        ],
                    },
                ],
            },
            {
                id: 'security',
                title: 'තොරතුරු ආරක්ෂා කරන ආකාරය',
                blocks: [
                    {
                        kind: 'p',
                        text: 'ප්‍රවේශයට සත්‍යාපනය අවශ්‍ය වන අතර බලය පැවරීම බලාත්මක කරන්නේ පසුපස පද්ධතිය මගිනි. මුරපද bcrypt hashing සමඟ ගබඩා වන අතර කිසිවිටෙක සරල පෙළ ලෙස නොතබයි. සැසි කාල සීමිත ටෝකන් මගින් ආරක්ෂා වේ, සන්නිවේදනය ගමන් කරන අතරතුර සංකේතනය වේ, විහාර දත්ත වෙන් වේ, පරිපාලන ක්‍රියා ලඝු වේ, උපස්ථ සහ ප්‍රතිසාධන විධිවිධාන පවත්වා ගැනේ.',
                    },
                    {
                        kind: 'p',
                        text: 'කිසිදු පද්ධතියක් සම්පූර්ණයෙන් ආරක්ෂිත නොවේ. ඔබේ තොරතුරු වලට බලපාන ආරක්ෂාව උල්ලංඝනයක් සිදු වුවහොත්, අදාළ විහාරයට සහ පරිශීලකයින්ට අනවශ්‍ය ප්‍රමාදයක් නොමැතිව දැනුම් දෙනු ලැබේ.',
                    },
                ],
            },
            {
                id: 'rights',
                title: 'ඔබේ අයිතිවාසිකම්',
                blocks: [
                    {kind: 'p', text: 'ඔබට ඔබේ විහාරයෙන් මේවා ඉල්ලා සිටිය හැක:'},
                    {
                        kind: 'list',
                        items: [
                            'ඔබ පිළිබඳ තබා ඇති තොරතුරු ඔබට පෙන්වීමට, සහ වැරදි දේ නිවැරදි කිරීමට;',
                            'ඔබේම ගිණුම් තොරතුරු සහ වෙන් කිරීම් ඉතිහාසයේ පිටපතක් ලබා දීමට;',
                            'ඔබේ ගිණුම වසා දමා රඳවා ගැනීමට අවශ්‍ය නොවන විස්තර ඉවත් කිරීමට;',
                            'අවශ්‍ය නොවන දැනුම්දීම් නවත්වා, අවසරය ඉවත් කළ බව සටහන් කිරීමට;',
                            'ඔබේ ලියාපදිංචිය, වෙන් කිරීම හෝ මාරු කිරීම සම්බන්ධ තීරණයක් ගත් ආකාරය පැහැදිලි කිරීමට.',
                        ],
                    },
                    {
                        kind: 'p',
                        text: 'ඉල්ලීම් හසුරුවන්නේ විහාරයේ විහාර පාලක හෝ සහ-පරිපාලක විසිනි; වේදිකා මට්ටමේ කරුණු `contact@inquicksolutions.com` හෝ `+94 11 727 5300` හරහා Quick Solutions (PVT) Ltd වෙත යොමු කළ හැක.',
                    },
                ],
            },
            {
                id: 'language',
                title: 'භාෂාව සහ ප්‍රවේශ්‍යතාව',
                blocks: [
                    {
                        kind: 'p',
                        text: 'පද්ධතිය සිංහල සහ ඉංග්‍රීසි භාෂා සඳහා සහාය දක්වන අතර මෙම ප්‍රතිපත්තිය භාෂා දෙකෙන්ම ප්‍රකාශිතය. අතුරුමුහුණත නිර්මාණය කර ඇත්තේ ඩෙස්ක්ටොප්, ටැබ්ලට් සහ ජංගම තිර සඳහා මෙන්ම විවිධ ඩිජිටල් අත්දැකීම් මට්ටම් සහිත පරිශීලකයින්ට භාවිත කළ හැකි වන පරිදිය.',
                    },
                ],
            },
            {
                id: 'changes',
                title: 'මෙම ප්‍රතිපත්තියේ වෙනස්කම්',
                blocks: [
                    {
                        kind: 'p',
                        text: 'පද්ධතිය සංවර්ධනය වන විට මෙම ප්‍රතිපත්තිය යාවත්කාලීන විය හැක. ඉහත බලපැවැත්වීමේ දිනය වෙනස් වන අතර සැලකිය යුතු වෙනස්කම් බලාත්මක වීමට පෙර උපකරණ පුවරුවේ නිවේදනය කෙරේ.',
                    },
                ],
            },
        ],
    },
}