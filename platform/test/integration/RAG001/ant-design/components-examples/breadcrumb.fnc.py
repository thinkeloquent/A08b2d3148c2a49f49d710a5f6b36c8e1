"""
Component functions for: breadcrumb

Each public function (no leading underscore) is registered automatically
and callable via the API at POST /components/breadcrumb/run/{function_name}.

Functions receive an optional `params` dict from the request body
and must return a JSON-serialisable value.
"""


def get_variants(params=None):
    """List available breadcrumb example variants with source code.

    Returns a list of variant objects with name, description, and sourcecode.
    Accepts optional params.selected (list of variant names) to filter results.
    """
    all_variants = [
        {
            "name": "Basic Usage (Static)",
            "description": "Simplest implementation using the items prop",
            "sourcecode": (
                "import React from 'react';\n"
                "import { Breadcrumb } from 'antd';\n\n"
                "const App: React.FC = () => (\n"
                "  <Breadcrumb\n"
                "    items={[\n"
                "      { title: 'Home' },\n"
                "      { title: <a href=\"\">Application Center</a> },\n"
                "      { title: <a href=\"\">Application List</a> },\n"
                "      { title: 'An Application' },\n"
                "    ]}\n"
                "  />\n"
                ");\n\n"
                "export default App;"
            ),
        },
        {
            "name": "With Custom Icons",
            "description": "Adding icons to breadcrumb items",
            "sourcecode": (
                "import React from 'react';\n"
                "import { HomeOutlined, UserOutlined } from '@ant-design/icons';\n"
                "import { Breadcrumb } from 'antd';\n\n"
                "const App: React.FC = () => (\n"
                "  <Breadcrumb\n"
                "    items={[\n"
                "      { href: '', title: <HomeOutlined /> },\n"
                "      { href: '', title: (<><UserOutlined /><span>User List</span></>) },\n"
                "      { title: 'Application' },\n"
                "    ]}\n"
                "  />\n"
                ");\n\n"
                "export default App;"
            ),
        },
        {
            "name": "With Dropdown Menu",
            "description": "Nested navigation with dropdown menus",
            "sourcecode": (
                "import React from 'react';\n"
                "import { Breadcrumb } from 'antd';\n\n"
                "const App: React.FC = () => (\n"
                "  <Breadcrumb\n"
                "    items={[\n"
                "      { title: 'Ant Design' },\n"
                "      { title: <a href=\"\">Component</a> },\n"
                "      {\n"
                "        title: 'General',\n"
                "        menu: {\n"
                "          items: [\n"
                "            { key: '1', label: <a href=\"http://www.alipay.com/\">General</a> },\n"
                "            { key: '2', label: <a href=\"http://www.taobao.com/\">Layout</a> },\n"
                "            { key: '3', label: <a href=\"http://www.tmall.com/\">Navigation</a> },\n"
                "          ],\n"
                "        },\n"
                "      },\n"
                "      { title: 'Button' },\n"
                "    ]}\n"
                "  />\n"
                ");\n\n"
                "export default App;"
            ),
        },
        {
            "name": "Custom Separator",
            "description": "Change the default / separator to an arrow or any other character",
            "sourcecode": (
                "import React from 'react';\n"
                "import { Breadcrumb } from 'antd';\n\n"
                "const App: React.FC = () => (\n"
                "  <Breadcrumb\n"
                '    separator=">"\n'
                "    items={[\n"
                "      { title: 'Home' },\n"
                "      { title: 'Application Center', href: '' },\n"
                "      { title: 'Application List', href: '' },\n"
                "      { title: 'An Application' },\n"
                "    ]}\n"
                "  />\n"
                ");\n\n"
                "export default App;"
            ),
        },
        {
            "name": "React Router v6",
            "description": "Dynamic breadcrumbs from URL path — most common real-world use case",
            "sourcecode": (
                'import React from "react";\n'
                'import { useLocation, Link } from "react-router-dom";\n'
                'import { Breadcrumb } from "antd";\n\n'
                "const BreadcrumbLayout = () => {\n"
                "  const location = useLocation();\n"
                '  const pathSnippets = location.pathname.split("/").filter((i) => i);\n\n'
                "  const breadcrumbItems = [\n"
                '    { title: <Link to="/">Home</Link>, key: "home" },\n'
                "    ...pathSnippets.map((_, index) => {\n"
                '      const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;\n'
                "      const title = pathSnippets[index];\n"
                "      const displayTitle = title.charAt(0).toUpperCase() + title.slice(1);\n"
                "      return { key: url, title: <Link to={url}>{displayTitle}</Link> };\n"
                "    }),\n"
                "  ];\n\n"
                "  return (\n"
                '    <div className="demo">\n'
                "      <Breadcrumb items={breadcrumbItems} />\n"
                "    </div>\n"
                "  );\n"
                "};\n\n"
                "export default BreadcrumbLayout;"
            ),
        },
    ]

    # If params.selected provided, filter to only those variant names
    selected = (params or {}).get("selected")
    if selected:
        return [v for v in all_variants if v["name"] in selected]
    return all_variants


def get_props(params=None):
    """Return the breadcrumb component's prop definitions."""
    return {
        "component": "Breadcrumb",
        "import": "import { Breadcrumb } from 'antd';",
        "props": [
            {"name": "items", "type": "ItemType[]", "required": True, "description": "The routing stack information of breadcrumb"},
            {"name": "separator", "type": "ReactNode", "required": False, "default": "/", "description": "Custom separator"},
            {"name": "params", "type": "object", "required": False, "description": "Routing parameters"},
        ],
        "item_props": [
            {"name": "title", "type": "ReactNode", "required": True, "description": "Item title / content"},
            {"name": "href", "type": "string", "required": False, "description": "Target of hyperlink"},
            {"name": "menu", "type": "{ items: MenuItemType[] }", "required": False, "description": "Dropdown menu config"},
            {"name": "className", "type": "string", "required": False, "description": "Custom class for item"},
            {"name": "onClick", "type": "(e) => void", "required": False, "description": "Click handler"},
        ],
    }


def generate_items_testdata(params=None):
    """Generate a breadcrumb items array from a list of path segments.

    params:
      paths: list of {"title": str, "href": str|None} dicts
      separator: optional custom separator string
    """
    paths = (params or {}).get("paths", [
        {"title": "Home", "href": "/"},
        {"title": "Components", "href": "/components"},
        {"title": "Breadcrumb", "href": None},
    ])
    separator = (params or {}).get("separator", "/")

    items = []
    for p in paths:
        item = {"title": p["title"]}
        if p.get("href"):
            item["href"] = p["href"]
        items.append(item)

    code = "import { Breadcrumb } from 'antd';\n\n"
    if separator != "/":
        code += f'<Breadcrumb separator="{separator}"\n'
    else:
        code += "<Breadcrumb\n"
    code += "  items={[\n"
    for item in items:
        if "href" in item:
            code += "    {\n"
            code += f'      title: <a href="{item["href"]}">{item["title"]}</a>,\n'
            code += "    },\n"
        else:
            code += "    {\n"
            code += f"      title: '{item['title']}',\n"
            code += "    },\n"
    code += "  ]}\n/>"

    return {"items": items, "separator": separator, "code": code}
