from enum import StrEnum


class LanguageCode(StrEnum):
    RU = "ru"
    KG = "kg"
    EN = "en"


class SortDirection(StrEnum):
    ASC = "asc"
    DESC = "desc"


class CurrencyCode(StrEnum):
    KGS = "KGS"


class ProjectStatus(StrEnum):
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    FUNDRAISING = "fundraising"
    FUNDED = "funded"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    FROZEN = "frozen"


class ProjectType(StrEnum):
    DONATION = "donation"
    REWARD = "reward"
    PREORDER = "preorder"
    BUSINESS_SUPPORT = "business_support"
    INVESTMENT_DISABLED = "investment_disabled"


class FundingType(StrEnum):
    ALL_OR_NOTHING = "all_or_nothing"
    FLEXIBLE_FUNDING = "flexible_funding"


class AuthorVerificationStatus(StrEnum):
    NOT_VERIFIED = "not_verified"
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"


class PaymentAttemptStatus(StrEnum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"


class MockPaymentMethod(StrEnum):
    TEST_CARD = "TEST_CARD"
    TEST_WALLET = "TEST_WALLET"
    TEST_BANK = "TEST_BANK"


class LedgerEntryType(StrEnum):
    PROJECT_GROSS = "PROJECT_GROSS"
    PLATFORM_FEE = "PLATFORM_FEE"
    PROJECT_NET = "PROJECT_NET"
    REFUND = "REFUND"
    ADMIN_ADJUSTMENT = "ADMIN_ADJUSTMENT"


class LedgerEntryStatus(StrEnum):
    POSTED = "posted"
    VOIDED = "voided"


class ReportStatus(StrEnum):
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    HIDDEN = "hidden"


class ComplaintStatus(StrEnum):
    OPEN = "open"
    IN_REVIEW = "in_review"
    RESOLVED = "resolved"
    REJECTED = "rejected"


class ComplaintReason(StrEnum):
    FRAUD = "fraud"
    FALSE_INFORMATION = "false_information"
    NO_REPORTS = "no_reports"
    INSULTS = "insults"
    PROHIBITED_CONTENT = "prohibited_content"
    OTHER = "other"
