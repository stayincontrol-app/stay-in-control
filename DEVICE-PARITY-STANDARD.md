# Stay in Control — Device & Role Parity Standard

This rule is mandatory for all current and future work on the principal application.

## One application, one behavior

Stay in Control uses one codebase and one source of truth across phone, tablet, laptop and desktop. Device size may change layout and navigation presentation, but must not change feature availability, business logic, permissions, data, translations, authentication behavior or results.

## Required device parity

Every feature or bug fix must work on:
- iPhone / mobile Safari
- Android / mobile Chrome
- iPad and other tablets
- Laptop browsers
- Desktop browsers

A feature is not considered complete when it works on only one viewport.

## Required role parity

Every feature must be checked against the permissions for:
- Super Administrator
- Administrator
- Owner

The same role must have the same authorized capabilities on every device. Layout may differ; permission and behavior may not.

## Mandatory functional areas

Cross-device parity applies to the entire product, including:
- login, session persistence, logout and inactivity
- password recovery and invite/access links
- email and CPF flows
- all 10 languages and dynamically rendered text
- dashboard and filters
- property/unit and owner/administrator linking
- reservations
- calendar and iCal
- expenses and additional income
- recurring expenses
- reports, printing and export
- contracts
- user access, resend access and role controls
- commercial plans, limits, courtesy and payment status
- banners, advertising and image rotation
- attachments
- support/WhatsApp actions
- archived/removed records and audit/history

## Responsive UI rule

Responsive CSS may reorganize content, switch desktop sidebar to mobile bottom navigation, stack forms, resize banners and convert tables to scrollable layouts. It must never remove the only way to access an authorized feature.

No feature may be implemented as mobile-only or desktop-only unless explicitly approved as a product requirement.

## Translation rule

Changing the selected language must update the full visible interface on every device and for every role. User-entered data and proper names are not translated. UI labels, messages, buttons, placeholders, filters, dialogs, errors and dynamic content must follow the selected language.

## Data rule

Phone, tablet, laptop and desktop must read/write the same backend records. Local storage can cache session/UI state but cannot become an independent source of truth for properties, permissions, users or financial data.

## Completion rule

For every future change, the default acceptance criteria are:
1. same feature behavior across mobile, tablet and desktop;
2. correct permissions for Super Administrator, Administrator and Owner;
3. no horizontal overflow or inaccessible controls at common viewport sizes;
4. selected language applied to static and dynamic UI;
5. backend data and calculations identical regardless of device;
6. no regression to login, session, password reset, navigation, property scope, banners or reports.

This standard remains in force unless the product owner explicitly changes it.