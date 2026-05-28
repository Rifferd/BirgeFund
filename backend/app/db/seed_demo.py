from datetime import UTC, date, datetime
from decimal import Decimal

from app.core.permissions import DEFAULT_PERMISSION_TITLES, Permissions
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.modules.banners.model import Banner, BannerTranslation
from app.modules.categories.model import Category, CategoryTranslation
from app.modules.cms.model import CMSPage, CMSPageTranslation
from app.modules.ledger.service import LedgerService
from app.modules.payments.model import PaymentAttempt
from app.modules.payments.service import PlatformFeeService
from app.modules.projects.model import Project, ProjectTranslation
from app.modules.roles.model import Permission, Role
from app.modules.translations.model import StaticTranslation
from app.modules.translations.service import DEFAULT_STATIC_TRANSLATIONS
from app.modules.users.model import User
from app.shared.enums import (
    BannerPlacement,
    FundingType,
    MockPaymentMethod,
    PaymentAttemptStatus,
    ProjectStatus,
    ProjectType,
)


DEMO_USERS = [
    {
        "email": "admin@birgefund.kg",
        "password": "AdminPass123!",
        "full_name": "Demo Admin",
        "role": "super_admin",
    },
    {
        "email": "moderator@birgefund.kg",
        "password": "ModeratorPass123!",
        "full_name": "Demo Moderator",
        "role": "moderator",
    },
    {
        "email": "finance@birgefund.kg",
        "password": "FinancePass123!",
        "full_name": "Demo Finance Manager",
        "role": "finance_manager",
    },
    {
        "email": "content@birgefund.kg",
        "password": "ContentPass123!",
        "full_name": "Demo Content Manager",
        "role": "content_manager",
    },
    {
        "email": "author@birgefund.kg",
        "password": "AuthorPass123!",
        "full_name": "Demo Project Author",
        "role": "author",
    },
    {
        "email": "backer@birgefund.kg",
        "password": "BackerPass123!",
        "full_name": "Demo Backer",
        "role": "backer",
    },
]


ROLE_PERMISSION_CODES = {
    "super_admin": list(DEFAULT_PERMISSION_TITLES.keys()),
    "moderator": [
        Permissions.PROJECTS_MODERATE,
        Permissions.PROJECTS_FREEZE,
        Permissions.REPORTS_MODERATE,
        Permissions.COMPLAINTS_MANAGE,
        Permissions.AUDIT_READ,
    ],
    "finance_manager": [
        Permissions.PAYMENTS_READ,
        Permissions.PAYMENTS_REFUND,
        Permissions.AUDIT_READ,
    ],
    "content_manager": [
        Permissions.CMS_UPDATE,
        Permissions.TRANSLATIONS_UPDATE,
    ],
    "author": [
        Permissions.PROJECTS_CREATE,
        Permissions.PROJECTS_UPDATE,
    ],
    "backer": [],
}


def get_or_create_permission(db, code: str, title: str) -> Permission:
    permission = db.query(Permission).filter(Permission.code == code).first()

    if permission is not None:
        return permission

    permission = Permission(
        code=code,
        title=title,
        description=f"System permission: {code}",
    )
    db.add(permission)
    db.flush()
    return permission


def get_or_create_role(db, name: str, title: str) -> Role:
    role = db.query(Role).filter(Role.name == name).first()

    if role is not None:
        return role

    role = Role(
        name=name,
        title=title,
        description=f"Demo role: {title}",
        is_system=True,
        is_active=True,
    )
    db.add(role)
    db.flush()
    return role


def seed_permissions_and_roles(db) -> dict[str, Role]:
    permissions: dict[str, Permission] = {}

    for code, title in DEFAULT_PERMISSION_TITLES.items():
        permissions[code] = get_or_create_permission(db, code, title)

    role_titles = {
        "super_admin": "Super Admin",
        "moderator": "Moderator",
        "finance_manager": "Finance Manager",
        "content_manager": "Content Manager",
        "author": "Author",
        "backer": "Backer",
    }

    roles: dict[str, Role] = {}

    for role_name, title in role_titles.items():
        role = get_or_create_role(db, role_name, title)

        for permission_code in ROLE_PERMISSION_CODES[role_name]:
            permission = permissions[permission_code]

            if permission not in role.permissions:
                role.permissions.append(permission)

        roles[role_name] = role

    db.flush()
    return roles


def seed_users(db, roles: dict[str, Role]) -> dict[str, User]:
    users: dict[str, User] = {}

    for item in DEMO_USERS:
        user = db.query(User).filter(User.email == item["email"]).first()

        if user is None:
            user = User(
                email=item["email"],
                password_hash=hash_password(item["password"]),
                full_name=item["full_name"],
                preferred_language="ru",
                is_active=True,
                is_verified=True,
                is_blocked=False,
            )
            db.add(user)
            db.flush()

        role = roles[item["role"]]

        if role not in user.roles:
            user.roles.append(role)

        users[item["email"]] = user

    db.flush()
    return users


def get_or_create_category(db, slug: str, sort_order: int, translations: list[dict]) -> Category:
    category = db.query(Category).filter(Category.slug == slug).first()

    if category is not None:
        return category

    category = Category(
        slug=slug,
        sort_order=sort_order,
        is_active=True,
    )

    category.translations = [
        CategoryTranslation(**translation)
        for translation in translations
    ]

    db.add(category)
    db.flush()
    return category


def seed_categories(db) -> dict[str, Category]:
    return {
        "education": get_or_create_category(
            db,
            slug="education",
            sort_order=1,
            translations=[
                {
                    "language": "ru",
                    "name": "Образование",
                    "description": "Школы, курсы, библиотеки и образовательные инициативы",
                },
                {
                    "language": "kg",
                    "name": "Билим берүү",
                    "description": "Мектептер, курстар, китепканалар жана билим берүү демилгелери",
                },
                {
                    "language": "en",
                    "name": "Education",
                    "description": "Schools, courses, libraries and educational initiatives",
                },
            ],
        ),
        "culture": get_or_create_category(
            db,
            slug="culture",
            sort_order=2,
            translations=[
                {
                    "language": "ru",
                    "name": "Культура",
                    "description": "Культурные, творческие и общественные инициативы",
                },
                {
                    "language": "kg",
                    "name": "Маданият",
                    "description": "Маданий, чыгармачылык жана коомдук демилгелер",
                },
                {
                    "language": "en",
                    "name": "Culture",
                    "description": "Cultural, creative and community initiatives",
                },
            ],
        ),
        "social": get_or_create_category(
            db,
            slug="social",
            sort_order=3,
            translations=[
                {
                    "language": "ru",
                    "name": "Социальные проекты",
                    "description": "Помощь людям, сообществам и локальным инициативам",
                },
                {
                    "language": "kg",
                    "name": "Социалдык долбоорлор",
                    "description": "Адамдарга, коомдорго жана жергиликтүү демилгелерге жардам",
                },
                {
                    "language": "en",
                    "name": "Social projects",
                    "description": "Support for people, communities and local initiatives",
                },
            ],
        ),
    }


def seed_static_translations(db) -> None:
    for item in DEFAULT_STATIC_TRANSLATIONS:
        existing = (
            db.query(StaticTranslation)
            .filter(
                StaticTranslation.namespace == item.namespace,
                StaticTranslation.key == item.key,
            )
            .first()
        )

        if existing is not None:
            continue

        db.add(StaticTranslation(**item.model_dump()))

    db.flush()


def get_or_create_cms_page(db) -> CMSPage:
    page = db.query(CMSPage).filter(CMSPage.slug == "test-mode").first()

    if page is not None:
        return page

    page = CMSPage(slug="test-mode")
    page.publish()

    page.translations = [
        CMSPageTranslation(
            language="ru",
            title="Тестовый режим",
            content="BirgeFund работает в тестовом режиме. Реальные платежи не принимаются, а все операции являются демонстрационными.",
            meta_title="Тестовый режим BirgeFund",
            meta_description="Описание тестового режима платформы BirgeFund.",
        ),
        CMSPageTranslation(
            language="kg",
            title="Тест режими",
            content="BirgeFund тест режиминде иштейт. Чыныгы төлөмдөр кабыл алынбайт.",
            meta_title="BirgeFund тест режими",
            meta_description="BirgeFund платформасынын тест режими.",
        ),
        CMSPageTranslation(
            language="en",
            title="Test mode",
            content="BirgeFund works in test mode. Real payments are not accepted.",
            meta_title="BirgeFund test mode",
            meta_description="BirgeFund platform test mode explanation.",
        ),
    ]

    db.add(page)
    db.flush()
    return page


def get_or_create_banner(db) -> Banner:
    banner = db.query(Banner).filter(Banner.slug == "home-test-mode-banner").first()

    if banner is not None:
        return banner

    banner = Banner(
        slug="home-test-mode-banner",
        placement=BannerPlacement.HOME_HERO,
        image_file_id=None,
        link_url="/test-mode",
        sort_order=1,
        is_active=True,
        starts_at=None,
        ends_at=None,
    )

    banner.translations = [
        BannerTranslation(
            language="ru",
            title="BirgeFund работает в тестовом режиме",
            subtitle="Поддерживайте проекты без реальных списаний. Все платежи демонстрационные.",
            cta_text="Подробнее",
        ),
        BannerTranslation(
            language="kg",
            title="BirgeFund тест режиминде иштейт",
            subtitle="Долбоорлорду чыныгы төлөмсүз колдоңуз. Бардык төлөмдөр демонстрациялык.",
            cta_text="Кененирээк",
        ),
        BannerTranslation(
            language="en",
            title="BirgeFund works in test mode",
            subtitle="Support projects without real charges. All payments are demo-only.",
            cta_text="Learn more",
        ),
    ]

    db.add(banner)
    db.flush()
    return banner


def get_or_create_demo_project(
    db,
    *,
    author: User,
    category: Category,
) -> Project:
    project = db.query(Project).filter(Project.slug == "demo-school-library").first()

    if project is not None:
        return project

    project = Project(
        author_id=author.id,
        slug="demo-school-library",
        status=ProjectStatus.FUNDRAISING,
        project_type=ProjectType.PREORDER,
        funding_type=FundingType.ALL_OR_NOTHING,
        city="Ош",
        goal_amount=Decimal("300000.00"),
        currency="KGS",
        deadline=date(2026, 12, 31),
        submitted_at=datetime.now(UTC),
        approved_at=datetime.now(UTC),
        published_at=datetime.now(UTC),
    )

    project.translations = [
        ProjectTranslation(
            language="ru",
            title="Книги для школьной библиотеки",
            short_description="Собираем поддержку для обновления школьной библиотеки.",
            description="Demo-проект помогает сельской школе обновить библиотеку учебными и художественными книгами для учеников. Это демонстрационный проект, созданный для проверки платформы.",
            risks="Сроки поставки книг могут измениться.",
            refund_policy="Платформа работает в тестовом режиме. Реальные деньги не списываются.",
            reward_description="Участники получат благодарственное письмо от автора проекта.",
            report_text="Автор будет публиковать отчёты о закупке и передаче книг.",
        ),
        ProjectTranslation(
            language="kg",
            title="Мектеп китепканасы үчүн китептер",
            short_description="Мектеп китепканасын жаңыртуу үчүн колдоо чогултабыз.",
            description="Demo долбоор айылдык мектепке окуу жана көркөм китептерди алууга жардам берет.",
            risks="Китептерди жеткирүү мөөнөтү өзгөрүшү мүмкүн.",
            refund_policy="Платформа тест режиминде иштейт. Чыныгы акча алынбайт.",
            reward_description="Катышуучулар автордон ыраазычылык кат алышат.",
            report_text="Автор китептерди сатып алуу жана тапшыруу тууралуу отчёт жарыялайт.",
        ),
        ProjectTranslation(
            language="en",
            title="Books for a school library",
            short_description="We are collecting support to renew a school library.",
            description="This demo project helps a rural school renew its library with textbooks and fiction books for students.",
            risks="Book delivery dates may change.",
            refund_policy="The platform works in test mode. No real money is charged.",
            reward_description="Supporters will receive a thank-you letter from the author.",
            report_text="The author will publish reports about book purchase and delivery.",
        ),
    ]

    project.categories = [category]

    db.add(project)
    db.flush()
    return project


def get_or_create_pending_project(
    db,
    *,
    author: User,
    category: Category,
) -> Project:
    project = db.query(Project).filter(Project.slug == "demo-cultural-workshop").first()

    if project is not None:
        return project

    project = Project(
        author_id=author.id,
        slug="demo-cultural-workshop",
        status=ProjectStatus.PENDING_REVIEW,
        project_type=ProjectType.DONATION,
        funding_type=FundingType.FLEXIBLE_FUNDING,
        city="Бишкек",
        goal_amount=Decimal("150000.00"),
        currency="KGS",
        deadline=date(2026, 11, 30),
        submitted_at=datetime.now(UTC),
    )

    project.translations = [
        ProjectTranslation(
            language="ru",
            title="Творческая мастерская для подростков",
            short_description="Открываем бесплатные занятия по творчеству для подростков.",
            description="Demo-проект для проверки модерации. Инициатива помогает подросткам посещать творческие занятия бесплатно.",
            risks="Расписание занятий может измениться.",
            refund_policy="Платформа работает в тестовом режиме.",
        )
    ]

    project.categories = [category]

    db.add(project)
    db.flush()
    return project


def seed_demo_payment(db, *, backer: User, project: Project) -> PaymentAttempt:
    payment = (
        db.query(PaymentAttempt)
        .filter(
            PaymentAttempt.user_id == backer.id,
            PaymentAttempt.idempotency_key == "seed-demo-payment-001",
        )
        .first()
    )

    if payment is None:
        payment = PaymentAttempt(
            user_id=backer.id,
            project_id=project.id,
            amount=Decimal("10000.00"),
            currency="KGS",
            method=MockPaymentMethod.TEST_CARD,
            status=PaymentAttemptStatus.SUCCESS,
            idempotency_key="seed-demo-payment-001",
            request_payload={
                "comment": "Seed demo support",
                "anonymous": False,
            },
            confirmed_at=datetime.now(UTC),
        )
        db.add(payment)
        db.flush()

    ledger = LedgerService(db)

    if not ledger.has_entries_for_payment_attempt(payment.id):
        platform_fee = PlatformFeeService(db).calculate_fee(
            project_type=project.project_type,
            amount=payment.amount,
        )

        ledger.create_payment_entries(
            payment_attempt=payment,
            platform_fee_amount=platform_fee,
            created_by_id=backer.id,
        )

    db.flush()
    return payment


def main() -> None:
    db = SessionLocal()

    try:
        roles = seed_permissions_and_roles(db)
        users = seed_users(db, roles)
        categories = seed_categories(db)
        seed_static_translations(db)

        get_or_create_cms_page(db)
        get_or_create_banner(db)

        # Creates default platform fee rules: donation 0%, reward 5%, preorder/business 7%.
        PlatformFeeService(db).create_default_rules()

        author = users["author@birgefund.kg"]
        backer = users["backer@birgefund.kg"]

        fundraising_project = get_or_create_demo_project(
            db,
            author=author,
            category=categories["education"],
        )
        get_or_create_pending_project(
            db,
            author=author,
            category=categories["culture"],
        )

        seed_demo_payment(
            db,
            backer=backer,
            project=fundraising_project,
        )

        db.commit()

        print("Demo seed completed.")
        print("")
        print("Users:")
        for user in DEMO_USERS:
            print(f"- {user['email']} / {user['password']} / role={user['role']}")
        print("")
        print("Demo project:")
        print("- slug=demo-school-library")
        print("- status=fundraising")
        print("- seeded successful payment=10000 KGS")

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
