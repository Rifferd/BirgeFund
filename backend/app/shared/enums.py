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
