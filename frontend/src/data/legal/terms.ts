import type {LegalDocSet} from './types'

/*
 * Terms and Conditions, in both languages. Section order and anchor ids match across the two
 * languages - the "on this page" list and the deep links are driven by them.
 */
export const termsDoc: LegalDocSet = {
    en: {
        title: 'Terms and Conditions',
        subtitle: 'The agreement for using the Temple Management System - temple registration and approval, roles, QR-based family registration, temple transfers, Dana bookings, online donations and the records each temple keeps.',
        updated: '26 October 2026',
        sections: [
            {
                id: 'agreement',
                title: 'The agreement',
                blocks: [
                    {
                        kind: 'p',
                        text: 'These Terms and Conditions govern the use of the **Temple Management System** ("the System"), a platform provided by **Quick Solutions (PVT) Ltd** ("Quick Solutions", "the provider", "we", "us") to Buddhist temples in Sri Lanka.',
                    },
                    {
                        kind: 'p',
                        text: 'Each temple receives the System as its own installation on its own domain, with its own records, users and administration. The temple is operated under the responsibility of its Temple Admin, under platform-level oversight by the Super Administrator.',
                    },
                    {
                        kind: 'p',
                        text: 'By creating an account, or by using the System, you agree to these terms. If you do not agree, you must not register or continue to use the System.',
                    },
                ],
            },
            {
                id: 'definitions',
                title: 'Definitions',
                blocks: [
                    {
                        kind: 'list',
                        items: [
                            '**Super Administrator** - the platform-level role held within Quick Solutions, responsible for temple registration oversight and platform settings. It is separate from every temple-level role.',
                            '**Temple Admin** - the Chief Incumbent Monk of a temple, or the authorised religious representative acting for that temple, holding full administrative rights within that temple.',
                            '**Co-Administrator** - a person appointed by the Temple Admin to assist with temple-level administration within assigned permissions.',
                            '**Temple User** - an authorised religious representative, committee or donor-council representative, or other approved temple user.',
                            '**Family User** - a registered family or community member associated with one temple.',
                            '**Temple Instance** - the temple\u2019s own deployment of the System, on its own domain, with its own separated data.',
                            '**Dana Slot** - a dated morning or afternoon almsgiving session published by a temple, with a defined capacity and status.',
                        ],
                    },
                ],
            },
            {
                id: 'eligibility',
                title: 'Who may use the System',
                blocks: [
                    {
                        kind: 'p',
                        text: 'Administering a temple or holding a committee role requires you to be at least 18 years old and to be authorised by that temple. Family accounts may be created by an adult for their own household, or by the Temple Admin or Co-Administrator on the family\u2019s behalf.',
                    },
                    {
                        kind: 'p',
                        text: 'The Chief Incumbent Monk is the Temple Admin of that temple but is not, by virtue of that position, the Super Administrator, and does not receive platform-level access.',
                    },
                ],
            },
            {
                id: 'accounts',
                title: 'Accounts and identity',
                blocks: [
                    {
                        kind: 'p',
                        text: 'A person is identified in the System by their **National Identity Card (NIC) number**, together with their first and last name, optional nickname, email address, mobile number and role. You confirm that the details you provide are true, that they belong to you, and that you will keep them current.',
                    },
                    {
                        kind: 'p',
                        text: 'One account is held per person. You are responsible for safeguarding your password and for all activity carried out under your account, and you must tell your Temple Admin immediately if you believe your account has been accessed by someone else.',
                    },
                    {
                        kind: 'p',
                        text: 'Account recovery is handled through the secure recovery process on the sign-in screen, or by your temple\u2019s administrator according to its approved procedure.',
                    },
                ],
            },
            {
                id: 'temple-registration',
                title: 'Temple registration and approval',
                blocks: [
                    {
                        kind: 'p',
                        text: 'Signing up does **not** register a temple. A temple is registered through the registration workflow: the Temple Admin (or authorised religious representative) submits the temple\u2019s information, and the **Super Administrator reviews and approves it**.',
                    },
                    {
                        kind: 'p',
                        text: 'While under review, a registration may be marked Pending, Additional Information Required, Approved or Rejected. After approval, the temple receives a unique system identifier and its register code (for example `SMB-VIH-0042`), and its restricted temple functions are activated.',
                    },
                    {
                        kind: 'p',
                        text: 'A temple must not be registered by a person who is not authorised by that temple, and temple details must not be submitted with false or misleading information. Approval decisions and status changes are recorded in the audit history.',
                    },
                ],
            },
            {
                id: 'roles',
                title: 'Roles and permissions',
                blocks: [
                    {
                        kind: 'p',
                        text: 'Access is granted by role and enforced on the server, not merely by what the interface displays. A user may access only the functions and records permitted for their role within their assigned temple, and may not view or change another temple\u2019s private data.',
                    },
                    {
                        kind: 'p',
                        text: 'Only the Temple Admin may appoint or remove the Co-Administrator, and only the Temple Admin may assign temple-level roles. Role assignments, permission changes and account status changes are recorded in the audit history.',
                    },
                ],
            },
            {
                id: 'qr-registration',
                title: 'Temple QR codes and family self-registration',
                blocks: [
                    {
                        kind: 'p',
                        text: 'Each temple has a unique QR code that leads to its own registration route. Scanning the code and submitting the registration form creates a family account associated with **that temple only**; the destination temple is validated by the System and cannot be changed by editing the link.',
                    },
                    {
                        kind: 'p',
                        text: 'Duplicate accounts are prevented: if a family already has an account, the user is guided to sign in and use the temple-change function instead of registering again.',
                    },
                ],
            },
            {
                id: 'transfers',
                title: 'Changing temples (temple transfers)',
                blocks: [
                    {
                        kind: 'p',
                        text: 'A registered Family User may change their registered temple through self-service - by selecting the destination temple or scanning its QR code - without requiring approval from a Temple Admin or Co-Administrator. The System validates the destination temple, updates the temple association, keeps the existing account and its history, and records the change for audit.',
                    },
                    {
                        kind: 'p',
                        text: 'A family account is **not** deactivated merely because the family moves, and a new account must not be created for the same family.',
                    },
                ],
            },
            {
                id: 'dana',
                title: 'Dana slots and bookings',
                blocks: [
                    {
                        kind: 'p',
                        text: 'Temples publish Dana slots with a date, time range, capacity and status. Bookings are held per session - a morning session and an afternoon session for each day - and each session has its own capacity. Only an authenticated Family User may book.',
                    },
                    {
                        kind: 'p',
                        text: 'The System checks availability and capacity on the server when a booking is saved, including when several families book at the same time, and refuses bookings that exceed capacity or that conflict with an existing booking. Booking statuses follow the approved workflow: Pending, Approved, Rejected, Cancelled or Completed.',
                    },
                    {
                        kind: 'p',
                        text: 'You may view and cancel your own bookings in line with the temple\u2019s cancellation policy. A Temple Admin or authorised Co-Administrator may not reduce a Dana slot below its confirmed booking count without following the approved resolution procedure. Booking and slot changes are recorded in the audit history.',
                    },
                ],
            },
            {
                id: 'donations',
                title: 'Online donations',
                blocks: [
                    {
                        kind: 'p',
                        text: 'Where a temple enables online donations, payments are processed by an approved payment gateway. The System records the transaction reference, date, amount and status, and a donation is confirmed only on **server-side verification** by the provider - a success message in the browser alone does not confirm a donation.',
                    },
                    {
                        kind: 'p',
                        text: 'Financial records are retained according to the approved financial record-retention policy. Donation acknowledgements issued by the temple must match the records in the System.',
                    },
                ],
            },
            {
                id: 'content',
                title: 'Announcements, events and temple content',
                blocks: [
                    {
                        kind: 'p',
                        text: 'Temples are responsible for the announcements, event details, Daham Pasal notices, library material and images they publish. Anything requiring approval must not be published until that approval has been recorded, and restricted announcements may be seen only by their intended recipients.',
                    },
                    {
                        kind: 'p',
                        text: 'Do not publish material you have no right to share, and obtain a guardian\u2019s permission before publishing photographs or details of children.',
                    },
                ],
            },
            {
                id: 'notifications',
                title: 'Notifications',
                blocks: [
                    {
                        kind: 'p',
                        text: 'The System sends notifications by **email, SMS and mobile push or browser notification**, according to the channels your temple has configured and the consent you have given. **No WhatsApp messages are sent by the System**.',
                    },
                    {
                        kind: 'p',
                        text: 'Notifications about bookings, approvals and changes contain only the information appropriate for the recipient. Delivery depends on third-party services and may occasionally be delayed or fail; failures are logged and handled under the agreed retry policy.',
                    },
                ],
            },
            {
                id: 'modules',
                title: 'Optional modules',
                blocks: [
                    {
                        kind: 'p',
                        text: 'Functions such as Daham Pasal management, event coordination, community and volunteer management, library resources and facilities maintenance are optional modules. A module is available to a temple only when it has been approved and enabled for that temple, and enabling it does not by itself grant access to users - access still follows roles and permissions.',
                    },
                    {
                        kind: 'p',
                        text: 'Modules that process children\u2019s information are subject to additional access restrictions and guardian procedures.',
                    },
                ],
            },
            {
                id: 'language',
                title: 'Language and terminology',
                blocks: [
                    {
                        kind: 'p',
                        text: 'The initial release supports **Sinhala and English**, and users may select their preferred interface language. Sinhala and English content entered by a temple is stored and displayed as entered.',
                    },
                    {
                        kind: 'p',
                        text: 'Buddhist religious and cultural terms follow the approved terminology list, with an English explanation where needed so that the original meaning is preserved. Language selection does not change a user\u2019s permissions.',
                    },
                ],
            },
            {
                id: 'acceptable-use',
                title: 'Acceptable use',
                blocks: [
                    {kind: 'p', text: 'You agree not to:'},
                    {
                        kind: 'list',
                        items: [
                            'register or claim a temple, role or account you are not authorised to hold;',
                            'access, copy or export data outside your permissions, or attempt to reach another temple\u2019s records;',
                            'attempt to bypass authentication, probe the System for vulnerabilities, or interfere with its operation;',
                            'submit false booking, donation or transfer information;',
                            'use the System to send unsolicited messages, or for any unlawful or disrespectful purpose.',
                        ],
                    },
                    {
                        kind: 'p',
                        text: 'Access may be suspended or withdrawn if these rules are broken, and serious misuse may be reported to the relevant authorities.',
                    },
                ],
            },
            {
                id: 'provider-access',
                title: 'Provider access and data ownership',
                blocks: [
                    {
                        kind: 'p',
                        text: 'The records created within a temple\u2019s instance belong to that temple. After handover, Quick Solutions\u2019 access to a temple\u2019s sensitive information follows the principle of least privilege and is limited to approved support work; the provider does not have unrestricted routine access to temple records. The Super Administrator\u2019s access to private family, donation or temple records is likewise restricted to explicitly authorised operational needs and is recorded in the audit history.',
                    },
                    {
                        kind: 'p',
                        text: 'Each temple is responsible for the ownership, renewal and cost of its own domain and hosting, unless a separate written arrangement says otherwise.',
                    },
                ],
            },
            {
                id: 'availability',
                title: 'Availability, support and changes',
                blocks: [
                    {
                        kind: 'p',
                        text: 'We aim to keep each temple instance available at all times, but maintenance, updates, third-party service outages or faults may interrupt access. Backups, recovery and monitoring arrangements apply as agreed for the temple.',
                    },
                    {
                        kind: 'p',
                        text: 'Support and maintenance after handover, along with performance targets, are governed by the support arrangement agreed with the temple. The System will continue to develop; material changes to these terms will be announced in the dashboard and reflected in the effective date above.',
                    },
                ],
            },
            {
                id: 'termination',
                title: 'Suspension and ending access',
                blocks: [
                    {
                        kind: 'p',
                        text: 'Your temple may close or deactivate your account in line with its approved policy, and you may ask it to close your account at any time. The System may restrict an account that is suspected of misuse while it is investigated.',
                    },
                    {
                        kind: 'p',
                        text: 'Records the temple must keep - registration and approval history, Dana bookings, donation entries, transfers and audit records - may be retained after an account is closed, with personal details reduced as described in the Privacy Policy.',
                    },
                ],
            },
            {
                id: 'liability',
                title: 'Liability',
                blocks: [
                    {
                        kind: 'p',
                        text: 'The System is a management and record-keeping tool. Each temple remains responsible for its own decisions, ceremonies, bookings, donations and finances, and for the content it publishes.',
                    },
                    {
                        kind: 'p',
                        text: 'To the extent permitted by law, Quick Solutions is not liable for indirect or consequential loss arising from use of the System, and nothing in these terms excludes liability that cannot lawfully be excluded.',
                    },
                ],
            },
            {
                id: 'law',
                title: 'Governing law and contact',
                blocks: [
                    {
                        kind: 'p',
                        text: 'These terms are governed by the laws of Sri Lanka, and the courts of Sri Lanka have jurisdiction over any dispute arising from them.',
                    },
                    {
                        kind: 'p',
                        text: 'Questions about these terms should first go to your temple\u2019s Temple Admin or Co-Administrator. Platform-level matters may be raised with Quick Solutions (PVT) Ltd - `contact@inquicksolutions.com`, `+94 11 727 5300`, `www.quicksolution.lk`.',
                    },
                ],
            },
        ],
    },

    si: {
        title: 'නියම සහ කොන්දේසි',
        subtitle: 'විහාර කළමනාකරණ පද්ධතිය භාවිත කිරීමේ ගිවිසුම - විහාර ලියාපදිංචිය සහ අනුමැතිය, භූමිකා, QR මගින් පවුල් ලියාපදිංචිය, විහාර මාරු කිරීම්, දාන වෙන් කිරීම්, අන්තර්ජාල පරිත්‍යාග සහ සෑම විහාරයක්ම තබා ගන්නා වාර්තා.',
        updated: '2026 ඔක්තෝබර් 26',
        sections: [
            {
                id: 'agreement',
                title: 'ගිවිසුම',
                blocks: [
                    {
                        kind: 'p',
                        text: 'මෙම නියම සහ කොන්දේසි පාලනය කරන්නේ ශ්‍රී ලංකාවේ බෞද්ධ විහාරස්ථාන සඳහා **Quick Solutions (PVT) Ltd** ("Quick Solutions", "සපයන්නා", "අපි") විසින් සපයන **විහාර කළමනාකරණ පද්ධතිය** ("පද්ධතිය") භාවිතයයි.',
                    },
                    {
                        kind: 'p',
                        text: 'සෑම විහාරයක්ම පද්ධතිය ලබා ගන්නේ තමන්ගේම වෙබ් ලිපිනයක් මත, තමන්ගේම වාර්තා, පරිශීලකයින් සහ පරිපාලනය සහිත, තමන්ටම වෙන් වූ ස්ථාපනයක් ලෙසය. විහාරය ක්‍රියාත්මක වන්නේ ප්‍රධාන පරිපාලකගේ වේදිකා මට්ටමේ අධීක්ෂණය යටතේ, එහි විහාර පාලකගේ වගකීම මතය.',
                    },
                    {
                        kind: 'p',
                        text: 'ගිණුමක් සෑදීමෙන් හෝ පද්ධතිය භාවිත කිරීමෙන් ඔබ මෙම නියම වලට එකඟ වේ. ඔබ එකඟ නොවන්නේ නම්, ලියාපදිංචි නොවිය යුතු අතර පද්ධතිය දිගටම භාවිත නොකළ යුතුය.',
                    },
                ],
            },
            {
                id: 'definitions',
                title: 'අර්ථ දැක්වීම්',
                blocks: [
                    {
                        kind: 'list',
                        items: [
                            '**ප්‍රධාන පරිපාලක** - Quick Solutions තුළ දරන වේදිකා මට්ටමේ භූමිකාව; විහාර ලියාපදිංචියේ අධීක්ෂණය සහ වේදිකා සැකසුම් සඳහා වගකිව යුතුය. එය සෑම විහාර මට්ටමේ භූමිකාවකින්ම වෙන් වේ.',
                            '**විහාර පාලක** - විහාරයක ප්‍රධාන සංඝනායක හිමියන්, නැතහොත් එම විහාරය වෙනුවෙන් ක්‍රියා කරන බලයලත් ආගමික නියෝජිතයා; එම විහාරය තුළ සම්පූර්ණ පරිපාලන අයිතිවාසිකම් දරයි.',
                            '**සහ-පරිපාලක** - විහාර පාලක විසින් පත් කරන, පවරා ඇති අවසර සීමා තුළ විහාර මට්ටමේ පරිපාලනයට සහාය වන පුද්ගලයා.',
                            '**විහාර පරිශීලක** - බලයලත් ආගමික නියෝජිතයෙකු, කාරක සභා හෝ දායක සභා නියෝජිතයෙකු, නැතහොත් අනුමත වෙනත් විහාර පරිශීලකයෙකු.',
                            '**පවුල් පරිශීලක** - එක් විහාරයක් සමඟ සම්බන්ධ වී ඇති ලියාපදිංචි පවුල් හෝ ප්‍රජා සාමාජිකයෙකු.',
                            '**විහාර අවස්ථාපනය** - විහාරයේම වෙබ් ලිපිනය මත, වෙන් වූ දත්ත සහිතව එම විහාරයට අයත් පද්ධති ස්ථාපනය.',
                            '**දාන වේලාව** - විහාරයක් විසින් ප්‍රකාශ කරන, නිශ්චිත ධාරිතාවක් සහ තත්ත්වයක් සහිත, දින වකවානුවක් සහිත උදෑසන හෝ සවස දාන වැඩසටහනක්.',
                        ],
                    },
                ],
            },
            {
                id: 'eligibility',
                title: 'පද්ධතිය භාවිත කළ හැක්කේ කාටද',
                blocks: [
                    {
                        kind: 'p',
                        text: 'විහාරයක් පරිපාලනය කිරීමට හෝ කාරක සභා භූමිකාවක් දැරීමට ඔබ අවම වශයෙන් වයස අවුරුදු 18 සම්පූර්ණ කළ අයෙකු විය යුතු අතර එම විහාරය විසින් බලයලත් කර තිබිය යුතුය. පවුල් ගිණුම් වැඩිහිටියෙකුට තම ගෘහය සඳහා, නැතහොත් විහාර පාලක හෝ සහ-පරිපාලකට පවුල වෙනුවෙන් සෑදිය හැක.',
                    },
                    {
                        kind: 'p',
                        text: 'ප්‍රධාන සංඝනායක හිමියන් එම විහාරයේ විහාර පාලක වේ, නමුත් එම තනතුර නිසාම ප්‍රධාන පරිපාලක නොවන අතර වේදිකා මට්ටමේ ප්‍රවේශයක් නොලබයි.',
                    },
                ],
            },
            {
                id: 'accounts',
                title: 'ගිණුම් සහ අනන්‍යතාව',
                blocks: [
                    {
                        kind: 'p',
                        text: 'පද්ධතිය තුළ පුද්ගලයෙකු හඳුනා ගන්නේ ඔහුගේ **ජාතික හැඳුනුම්පත් (ජා.හැ.) අංකය** මගින්, ඔහුගේ මුල් නම සහ වාසගම, අවශ්‍ය නම් අන්වර්ථ නාමය, ඊමේල් ලිපිනය, ජංගම දුරකථන අංකය සහ භූමිකාව සමඟිනි. ඔබ ලබා දෙන විස්තර සත්‍ය බවත්, ඒවා ඔබට අයත් බවත්, ඒවා යාවත්කාලීනව තබා ගන්නා බවත් ඔබ තහවුරු කරයි.',
                    },
                    {
                        kind: 'p',
                        text: 'එක් පුද්ගලයෙකුට එක් ගිණුමක් පමණි. ඔබේ මුරපදය ආරක්ෂා කිරීම සහ ඔබේ ගිණුම යටතේ සිදු වන සියලු ක්‍රියාකාරකම් සඳහා ඔබ වගකිව යුතු අතර, ඔබේ ගිණුම වෙනත් අයෙකු විසින් භාවිත කර ඇතැයි ඔබ සිතන්නේ නම් වහාම ඔබේ විහාර පාලකට දන්වන්න.',
                    },
                    {
                        kind: 'p',
                        text: 'ගිණුම් ප්‍රතිසාධනය සිදු වන්නේ පිවිසුම් තිරයේ ඇති ආරක්ෂිත ප්‍රතිසාධන ක්‍රියාවලිය හරහා, නැතහොත් අනුමත ක්‍රියාපටිපාටිය අනුව ඔබේ විහාරයේ පරිපාලක විසිනි.',
                    },
                ],
            },
            {
                id: 'temple-registration',
                title: 'විහාර ලියාපදිංචිය සහ අනුමැතිය',
                blocks: [
                    {
                        kind: 'p',
                        text: 'ලියාපදිංචි වීමෙන් විහාරයක් ලියාපදිංචි **නොවේ**. විහාරයක් ලියාපදිංචි වන්නේ ලියාපදිංචි ක්‍රියාවලිය හරහාය: විහාර පාලක (හෝ බලයලත් ආගමික නියෝජිතයා) විහාරයේ තොරතුරු ඉදිරිපත් කරන අතර **ප්‍රධාන පරිපාලක එය සමාලෝචනය කර අනුමත කරයි**.',
                    },
                    {
                        kind: 'p',
                        text: 'සමාලෝචනය වන අතරතුර ලියාපදිංචියක් අපේක්ෂිත, අමතර තොරතුරු අවශ්‍ය, අනුමත හෝ ප්‍රතික්ෂේප ලෙස සලකුණු කළ හැක. අනුමැතියෙන් පසු විහාරයට අනන්‍ය පද්ධති හැඳුනුමක් සහ එහි ලේඛන කේතය (උදාහරණයක් ලෙස `SMB-VIH-0042`) ලැබෙන අතර එහි සීමිත විහාර කාර්යයන් සක්‍රීය වේ.',
                    },
                    {
                        kind: 'p',
                        text: 'එම විහාරය විසින් බලයලත් නොකළ පුද්ගලයෙකු විසින් විහාරයක් ලියාපදිංචි නොකළ යුතු අතර විහාර විස්තර අසත්‍ය හෝ නොමඟ යවන තොරතුරු සමඟ ඉදිරිපත් නොකළ යුතුය. අනුමැති තීරණ සහ තත්ත්ව වෙනස්කම් විගණන ඉතිහාසයේ සටහන් වේ.',
                    },
                ],
            },
            {
                id: 'roles',
                title: 'භූමිකා සහ අවසර',
                blocks: [
                    {
                        kind: 'p',
                        text: 'ප්‍රවේශය ලබා දෙන්නේ භූමිකාව අනුව වන අතර එය බලාත්මක කරන්නේ සේවාදායකය මගින්, අතුරුමුහුණත පෙන්වන දේ පමණක් නොවේ. පරිශීලකයෙකුට පවරා ඇති විහාරය තුළ තම භූමිකාවට අවසර දී ඇති කාර්යයන් සහ වාර්තා පමණක් ප්‍රවේශ කළ හැකි අතර වෙනත් විහාරයක පෞද්ගලික දත්ත බැලීමට හෝ වෙනස් කිරීමට නොහැක.',
                    },
                    {
                        kind: 'p',
                        text: 'සහ-පරිපාලක පත් කිරීමට හෝ ඉවත් කිරීමට හැක්කේ විහාර පාලකට පමණක් වන අතර විහාර මට්ටමේ භූමිකා පැවරිය හැක්කේද විහාර පාලකට පමණි. භූමිකා පැවරීම්, අවසර වෙනස්කම් සහ ගිණුම් තත්ත්ව වෙනස්කම් විගණන ඉතිහාසයේ සටහන් වේ.',
                    },
                ],
            },
            {
                id: 'qr-registration',
                title: 'විහාර QR කේත සහ පවුල් ස්වයං-ලියාපදිංචිය',
                blocks: [
                    {
                        kind: 'p',
                        text: 'සෑම විහාරයකටම එහිම ලියාපදිංචි මාර්ගයට යොමු කරන අනන්‍ය QR කේතයක් ඇත. කේතය ස්කෑන් කර ලියාපදිංචි පෝරමය ඉදිරිපත් කිරීමෙන් **එම විහාරයට පමණක්** සම්බන්ධ පවුල් ගිණුමක් සෑදේ; ගමනාන්ත විහාරය පද්ධතිය විසින් තහවුරු කරන අතර සබැඳිය සංස්කරණය කිරීමෙන් එය වෙනස් කළ නොහැක.',
                    },
                    {
                        kind: 'p',
                        text: 'අනුපිටපත් ගිණුම් වළක්වනු ලැබේ: පවුලකට දැනටමත් ගිණුමක් තිබේ නම්, නැවත ලියාපදිංචි නොවී පිවිසී විහාර මාරු කිරීමේ කාර්යය භාවිත කරන ලෙස පරිශීලකයාට මඟ පෙන්වනු ලැබේ.',
                    },
                ],
            },
            {
                id: 'transfers',
                title: 'විහාර මාරු කිරීම',
                blocks: [
                    {
                        kind: 'p',
                        text: 'ලියාපදිංචි පවුල් පරිශීලකයෙකුට විහාර පාලක හෝ සහ-පරිපාලක අනුමැතියක් අවශ්‍ය නොවී, ස්වයං සේවාව හරහා - ගමනාන්ත විහාරය තෝරාගැනීමෙන් හෝ එහි QR කේතය ස්කෑන් කිරීමෙන් - තම ලියාපදිංචි විහාරය වෙනස් කළ හැක. පද්ධතිය ගමනාන්ත විහාරය තහවුරු කර, විහාර සම්බන්ධතාව යාවත්කාලීන කර, පවතින ගිණුම සහ එහි ඉතිහාසය රඳවා ගෙන, වෙනස විගණනය සඳහා සටහන් කරයි.',
                    },
                    {
                        kind: 'p',
                        text: 'පවුල පදිංචිය මාරු කිරීම නිසා පමණක් පවුල් ගිණුමක් අක්‍රීය **නොවේ**, එම පවුල සඳහා නව ගිණුමක් නිර්මාණය නොකළ යුතුය.',
                    },
                ],
            },
            {
                id: 'dana',
                title: 'දාන වේලාවන් සහ වෙන් කිරීම්',
                blocks: [
                    {
                        kind: 'p',
                        text: 'විහාර විසින් දිනය, වේලා පරාසය, ධාරිතාව සහ තත්ත්වය සහිත දාන වේලාවන් ප්‍රකාශ කරයි. වෙන් කිරීම් සිදු වන්නේ එක් එක් වාරය අනුවය - දිනකට උදෑසන වාරයක් සහ සවස වාරයක් - එක් එක් වාරයට තමන්ගේම ධාරිතාවක් ඇත. වෙන් කළ හැක්කේ සත්‍යාපිත පවුල් පරිශීලකයෙකුට පමණි.',
                    },
                    {
                        kind: 'p',
                        text: 'වෙන් කිරීමක් සුරකින විට පද්ධතිය සේවාදායකය මත ඇති ප්‍රමාණය සහ ධාරිතාව පරීක්ෂා කරයි - පවුල් කිහිපයක් එකම මොහොතේ වෙන් කරන විටද එසේමය - ධාරිතාව ඉක්මවන හෝ දැනටමත් ඇති වෙන් කිරීමක් සමඟ ගැටෙන ඉල්ලීම් ප්‍රතික්ෂේප කරයි. වෙන් කිරීම් තත්ත්ව අනුමත ක්‍රියාවලිය අනුගමනය කරයි: අපේක්ෂිත, අනුමත, ප්‍රතික්ෂේප, අවලංගු හෝ සම්පූර්ණ.',
                    },
                    {
                        kind: 'p',
                        text: 'විහාරයේ අවලංගු කිරීමේ ප්‍රතිපත්තිය අනුව ඔබට ඔබේම වෙන් කිරීම් බැලීමට සහ අවලංගු කිරීමට හැක. අනුමත විසඳුම් ක්‍රියාපටිපාටිය අනුගමනය නොකර විහාර පාලකට හෝ බලයලත් සහ-පරිපාලකට තහවුරු කළ වෙන් කිරීම් ගණනට වඩා අඩුවෙන් දාන වේලාවක් ධාරිතාව අඩු කළ නොහැක. වෙන් කිරීම් සහ වේලා වෙනස්කම් විගණන ඉතිහාසයේ සටහන් වේ.',
                    },
                ],
            },
            {
                id: 'donations',
                title: 'අන්තර්ජාල පරිත්‍යාග',
                blocks: [
                    {
                        kind: 'p',
                        text: 'විහාරයක් අන්තර්ජාල පරිත්‍යාග සක්‍රීය කර ඇත්නම්, ගෙවීම් සකසන්නේ අනුමත ගෙවීම් ද්වාරයක් මගිනි. පද්ධතිය ගනුදෙනු යොමු අංකය, දිනය, මුදල සහ තත්ත්වය සටහන් කරන අතර පරිත්‍යාගයක් තහවුරු වන්නේ සපයන්නා විසින් **සේවාදායකය මට්ටමින් තහවුරු කිරීමෙන්** පසුව පමණි - බ්‍රව්සරයේ පෙන්වන සාර්ථක පණිවිඩයක් පමණක් පරිත්‍යාගයක් තහවුරු නොකරයි.',
                    },
                    {
                        kind: 'p',
                        text: 'මූල්‍ය වාර්තා අනුමත මූල්‍ය වාර්තා රඳවා ගැනීමේ ප්‍රතිපත්තිය අනුව රඳවා ගැනේ. විහාරය විසින් නිකුත් කරන පරිත්‍යාග තහවුරු කිරීම් පද්ධතියේ වාර්තා සමඟ ගැළපිය යුතුය.',
                    },
                ],
            },
            {
                id: 'content',
                title: 'නිවේදන, උත්සව සහ විහාර අන්තර්ගතය',
                blocks: [
                    {
                        kind: 'p',
                        text: 'විහාර විසින් ප්‍රකාශ කරන නිවේදන, උත්සව විස්තර, දහම් පාසල් දැනුම්දීම්, පුස්තකාල ද්‍රව්‍ය සහ ඡායාරූප සඳහා එම විහාරය වගකිව යුතුය. අනුමැතියක් අවශ්‍ය ඕනෑම දෙයක් එම අනුමැතිය සටහන් වන තෙක් ප්‍රකාශ නොකළ යුතු අතර සීමිත නිවේදන දැකිය හැක්කේ ඒවා ඉලක්ක කළ ලබන්නන්ට පමණි.',
                    },
                    {
                        kind: 'p',
                        text: 'බෙදා ගැනීමට අයිතියක් නොමැති ද්‍රව්‍ය ප්‍රකාශ නොකරන්න, සහ ළමුන්ගේ ඡායාරූප හෝ විස්තර ප්‍රකාශ කිරීමට පෙර භාරකරුගේ අවසරය ලබා ගන්න.',
                    },
                ],
            },
            {
                id: 'notifications',
                title: 'දැනුම්දීම්',
                blocks: [
                    {
                        kind: 'p',
                        text: 'පද්ධතිය දැනුම්දීම් යවන්නේ **ඊමේල්, කෙටි පණිවිඩ (SMS) සහ ජංගම push හෝ බ්‍රව්සර් දැනුම්දීම්** මගින්, ඔබේ විහාරය වින්‍යාස කර ඇති නාලිකා සහ ඔබ දී ඇති අවසරය අනුවය. **පද්ධතිය WhatsApp පණිවිඩ නොයවයි**.',
                    },
                    {
                        kind: 'p',
                        text: 'වෙන් කිරීම්, අනුමැතීන් සහ වෙනස්කම් පිළිබඳ දැනුම්දීම් වල ඇතුළත් වන්නේ ලබන්නාට සුදුසු තොරතුරු පමණි. බෙදාහැරීම තෙවන පාර්ශව සේවා මත රඳා පවතින අතර සමහර විට ප්‍රමාද වීම හෝ අසාර්ථක වීම සිදු විය හැක; අසාර්ථක වීම් ලඝු වන අතර එකඟ වූ නැවත උත්සාහ ප්‍රතිපත්තිය යටතේ හසුරුවනු ලැබේ.',
                    },
                ],
            },
            {
                id: 'modules',
                title: 'අවශ්‍ය නම් පමණක් මොඩියුල',
                blocks: [
                    {
                        kind: 'p',
                        text: 'දහම් පාසල් කළමනාකරණය, උත්සව සම්බන්ධීකරණය, ප්‍රජා සහ ස්වේච්ඡා සේවක කළමනාකරණය, පුස්තකාල සම්පත් සහ පහසුකම් නඩත්තුව වැනි කාර්යයන් අවශ්‍ය නම් පමණක් භාවිත කරන මොඩියුල වේ. මොඩියුලයක් විහාරයකට ලැබෙන්නේ එය එම විහාරය සඳහා අනුමත කර සක්‍රීය කළ විට පමණක් වන අතර එය සක්‍රීය කිරීමෙන් පමණක් පරිශීලකයින්ට ප්‍රවේශය ලැබෙන්නේ නැත - ප්‍රවේශය තවමත් භූමිකා සහ අවසර අනුව තීරණය වේ.',
                    },
                    {
                        kind: 'p',
                        text: 'ළමුන්ගේ තොරතුරු සැකසෙන මොඩියුල අමතර ප්‍රවේශ සීමා සහ භාරකරු ක්‍රියාපටිපාටි වලට යටත් වේ.',
                    },
                ],
            },
            {
                id: 'language',
                title: 'භාෂාව සහ පාරිභාෂික වචන',
                blocks: [
                    {
                        kind: 'p',
                        text: 'ආරම්භක නිකුතුව **සිංහල සහ ඉංග්‍රීසි** භාෂා සඳහා සහාය දක්වන අතර පරිශීලකයින්ට තමන් කැමති අතුරුමුහුණත් භාෂාව තෝරා ගත හැක. විහාරයක් ඇතුළත් කරන සිංහල සහ ඉංග්‍රීසි අන්තර්ගතය ඇතුළත් කළ ආකාරයටම ගබඩා වී පෙන්වනු ලැබේ.',
                    },
                    {
                        kind: 'p',
                        text: 'බෞද්ධ ආගමික හා සංස්කෘතික වචන අනුමත පාරිභාෂික ලැයිස්තුව අනුගමනය කරන අතර මුල් අර්ථය ආරක්ෂා වන පරිදි අවශ්‍ය තැන ඉංග්‍රීසි පැහැදිලි කිරීමක් ද ලබා දේ. භාෂාව තේරීම පරිශීලකයෙකුගේ අවසර වෙනස් නොකරයි.',
                    },
                ],
            },
            {
                id: 'acceptable-use',
                title: 'පිළිගත හැකි භාවිතය',
                blocks: [
                    {kind: 'p', text: 'ඔබ පහත දේ නොකිරීමට එකඟ වේ:'},
                    {
                        kind: 'list',
                        items: [
                            'ඔබට අයිතියක් නොමැති විහාරයක්, භූමිකාවක් හෝ ගිණුමක් ලියාපදිංචි කිරීම හෝ ඒවා ඔබට අයත් යැයි පැවසීම;',
                            'ඔබේ අවසර වලින් පිටත දත්ත ප්‍රවේශ කිරීම, පිටපත් කිරීම හෝ අපනයනය කිරීම, නැතහොත් වෙනත් විහාරයක වාර්තා වලට ළඟා වීමට උත්සාහ කිරීම;',
                            'සත්‍යාපනය මඟ හැරීමට උත්සාහ කිරීම, පද්ධතියේ අඩුපාඩු සොයා බැලීම, නැතහොත් එහි ක්‍රියාකාරිත්වයට බාධා කිරීම;',
                            'අසත්‍ය වෙන් කිරීම්, පරිත්‍යාග හෝ මාරු කිරීම් තොරතුරු ඉදිරිපත් කිරීම;',
                            'අනවශ්‍ය පණිවිඩ යැවීමට, නැතහොත් නීති විරෝධී හෝ අගෞරවනීය අරමුණකට පද්ධතිය භාවිත කිරීම.',
                        ],
                    },
                    {
                        kind: 'p',
                        text: 'මෙම නීති කඩ කරන්නේ නම් ප්‍රවේශය තාවකාලිකව නවත්වා හෝ ඉවත් කළ හැකි අතර බරපතල අනිසි භාවිතය අදාළ බලධාරීන්ට වාර්තා කළ හැක.',
                    },
                ],
            },
            {
                id: 'provider-access',
                title: 'සපයන්නාගේ ප්‍රවේශය සහ දත්ත හිමිකාරිත්වය',
                blocks: [
                    {
                        kind: 'p',
                        text: 'විහාරයක අවස්ථාපනය තුළ නිර්මාණය වන වාර්තා එම විහාරයට අයත් වේ. භාරදීමෙන් පසු විහාරයක සංවේදී තොරතුරු සඳහා Quick Solutions හි ප්‍රවේශය අවම වරප්‍රසාද මූලධර්මය අනුව ක්‍රියා කරන අතර අනුමත සහාය කටයුතු වලට පමණක් සීමා වේ; සපයන්නාට විහාර වාර්තා සඳහා දෛනික අසීමිත ප්‍රවේශයක් නොමැත. ඒ ලෙසම ප්‍රධාන පරිපාලකගේ පෞද්ගලික පවුල්, පරිත්‍යාග හෝ විහාර වාර්තා සඳහා ප්‍රවේශය පැහැදිලිව බලයලත් ක්‍රියාකාරී අවශ්‍යතා වලට පමණක් සීමා වන අතර එය විගණන ඉතිහාසයේ සටහන් වේ.',
                    },
                    {
                        kind: 'p',
                        text: 'වෙනත් ලිඛිත විධිවිධානයක් නොමැති නම්, සෑම විහාරයකම වෙබ් ලිපිනයේ සහ සත්කාරකත්වයේ හිමිකාරිත්වය, අලුත් කිරීම සහ වියදම එම විහාරයේ වගකීමකි.',
                    },
                ],
            },
            {
                id: 'availability',
                title: 'ලබා ගැනීමේ හැකියාව, සහාය සහ වෙනස්කම්',
                blocks: [
                    {
                        kind: 'p',
                        text: 'අපි අපේක්ෂා කරන්නේ සෑම විහාර අවස්ථාපනයක්ම සෑම වේලාවකම ලබා ගත හැකිව තබා ගැනීමටය, නමුත් නඩත්තු කටයුතු, යාවත්කාලීන කිරීම්, තෙවන පාර්ශව සේවා ඇණහිටීම් හෝ දෝෂ නිසා ප්‍රවේශයට බාධා විය හැක. විහාරය සමඟ එකඟ වූ පරිදි උපස්ථ, ප්‍රතිසාධන සහ අධීක්ෂණ විධිවිධාන ක්‍රියාත්මක වේ.',
                    },
                    {
                        kind: 'p',
                        text: 'භාරදීමෙන් පසු සහාය සහ නඩත්තුව, එමෙන්ම කාර්ය සාධන ඉලක්ක, පාලනය වන්නේ විහාරය සමඟ එකඟ වූ සහාය විධිවිධානය මගිනි. පද්ධතිය දිගටම සංවර්ධනය වේ; මෙම නියම වල සැලකිය යුතු වෙනස්කම් උපකරණ පුවරුවේ නිවේදනය කර ඉහත බලපැවැත්වීමේ දිනයේ පිළිබිඹු වේ.',
                    },
                ],
            },
            {
                id: 'termination',
                title: 'තාවකාලිකව නැවැත්වීම සහ ප්‍රවේශය අවසන් කිරීම',
                blocks: [
                    {
                        kind: 'p',
                        text: 'ඔබේ විහාරයට එහි අනුමත ප්‍රතිපත්තිය අනුව ඔබේ ගිණුම වසා දැමීමට හෝ අක්‍රීය කිරීමට හැකි අතර ඔබට ඕනෑම වේලාවක ගිණුම වසා දමන ලෙස ඉල්ලා සිටිය හැක. අනිසි භාවිතයක් යැයි සැක කරන ගිණුමක් පරීක්ෂණය අතරතුර පද්ධතියට සීමා කළ හැක.',
                    },
                    {
                        kind: 'p',
                        text: 'විහාරය තබා ගත යුතු වාර්තා - ලියාපදිංචි සහ අනුමැති ඉතිහාසය, දාන වෙන් කිරීම්, පරිත්‍යාග සටහන්, මාරු කිරීම් සහ විගණන වාර්තා - ගිණුම වසා දැමීමෙන් පසුවද රඳවා ගත හැකි අතර පෞද්ගලිකත්ව ප්‍රතිපත්තියේ විස්තර කර ඇති පරිදි පෞද්ගලික විස්තර අඩු කරනු ලැබේ.',
                    },
                ],
            },
            {
                id: 'liability',
                title: 'වගකීම',
                blocks: [
                    {
                        kind: 'p',
                        text: 'පද්ධතිය කළමනාකරණ සහ වාර්තා තැබීමේ මෙවලමකි. සෑම විහාරයක්ම තම තීරණ, ආගමික කටයුතු, වෙන් කිරීම්, පරිත්‍යාග සහ මූල්‍ය කටයුතු සඳහා මෙන්ම තමන් ප්‍රකාශ කරන අන්තර්ගතය සඳහා වගකිව යුතුය.',
                    },
                    {
                        kind: 'p',
                        text: 'නීතිය අවසර දෙන ප්‍රමාණය දක්වා, පද්ධතිය භාවිතයෙන් සිදු වන වක්‍ර හෝ ප්‍රතිවිපාක අලාභ සඳහා Quick Solutions වගකීමක් නොදරයි, මෙම නියම වල කිසිවක් නීත්‍යානුකූලව බැහැර කළ නොහැකි වගකීමක් බැහැර නොකරයි.',
                    },
                ],
            },
            {
                id: 'law',
                title: 'පාලන නීතිය සහ සම්බන්ධ වීම',
                blocks: [
                    {
                        kind: 'p',
                        text: 'මෙම නියම පාලනය වන්නේ ශ්‍රී ලංකාවේ නීතිය මගිනි, ඒවායින් පැන නගින ඕනෑම ආරවුලක් සඳහා ශ්‍රී ලංකාවේ අධිකරණ වලට අධිකරණ බලය ඇත.',
                    },
                    {
                        kind: 'p',
                        text: 'මෙම නියම පිළිබඳ ප්‍රශ්න පළමුව යොමු කළ යුත්තේ ඔබේ විහාරයේ විහාර පාලක හෝ සහ-පරිපාලක වෙතය. වේදිකා මට්ටමේ කරුණු Quick Solutions (PVT) Ltd වෙත යොමු කළ හැක - `contact@inquicksolutions.com`, `+94 11 727 5300`, `www.quicksolution.lk`.',
                    },
                ],
            },
        ],
    },
}