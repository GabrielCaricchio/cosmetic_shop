import pytest
from Back.dtos.product_dto import ProductFilterDTO

def test_product_filter_dto_defaults():
    filter_dto = ProductFilterDTO(page=1, limit=20, search="baton")
    assert filter_dto.page == 1
    assert filter_dto.limit == 20
    assert filter_dto.search == "baton"
    assert filter_dto.offset == 0

def test_fuzzy_search_special_chars():
    # Pinned to Review Focus #4: "batom vermêlho", "shampô"
    filter_dto = ProductFilterDTO(search="batom vermêlho & shampô!")
    clean_query = filter_dto.clean_search_query()
    assert "batom" in clean_query
    assert "vermelho" in clean_query or "vermêlho" in clean_query
