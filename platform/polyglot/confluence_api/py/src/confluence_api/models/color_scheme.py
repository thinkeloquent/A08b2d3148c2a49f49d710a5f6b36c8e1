"""Color scheme models for Confluence look-and-feel customisation."""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from confluence_api.logger import create_logger

log = create_logger('confluence_api', __file__)


class ColorSchemeModel(BaseModel):
    """Individual color scheme defining UI element colors."""

    model_config = ConfigDict(populate_by_name=True)

    top_bar: str = Field("", alias="topBar")
    top_bar_menu_selected_background: str = Field(
        "", alias="topBarMenuSelectedBackground"
    )
    top_bar_menu_selected_text: str = Field("", alias="topBarMenuSelectedText")
    top_bar_menu_item_text: str = Field("", alias="topBarMenuItemText")
    header_button_base_bg: str = Field("", alias="headerButtonBaseBg")
    header_button_base_text: str = Field("", alias="headerButtonBaseText")
    heading_text: str = Field("", alias="headingText")
    links: str = ""
    border_color: str = Field("", alias="borderColor")
    nav_background: str = Field("", alias="navBackground")


class ColorSchemeThemeBasedModel(BaseModel):
    """Color scheme tied to a specific theme."""

    model_config = ConfigDict(populate_by_name=True)

    theme_key: str = Field("", alias="themeKey")
    color_scheme: ColorSchemeModel | None = Field(None, alias="colorScheme")


class SpaceColorSchemeTypeModel(BaseModel):
    """Indicates whether a space uses a custom or global color scheme."""

    model_config = ConfigDict(populate_by_name=True)

    type: str = ""
