1. Basic Usage (Static)
   The simplest implementation using the items prop.

```jsx
import React from 'react';
import { Breadcrumb } from 'antd';

const App: React.FC = () => (
  <Breadcrumb
    items={[
      {
        title: 'Home',
      },
      {
        title: <a href="">Application Center</a>,
      },
      {
        title: <a href="">Application List</a>,
      },
      {
        title: 'An Application',
      },
    ]}
  />
);

export default App;
```

2. With Custom Icons
   You can easily add icons to the title property.

```
import React from 'react';
import { HomeOutlined, UserOutlined } from '@ant-design/icons';
import { Breadcrumb } from 'antd';

const App: React.FC = () => (
  <Breadcrumb
    items={[
      {
        href: '',
        title: <HomeOutlined />,
      },
      {
        href: '',
        title: (
          <>
            <UserOutlined />
            <span>User List</span>
          </>
        ),
      },
      {
        title: 'Application',
      },
    ]}
  />
);

export default App;

```

3. With Dropdown Menu
   Use the menu property inside an item to create a dropdown. This is useful for navigation hierarchies where siblings exist (e.g., switching between different "Lists").

```jsx
import React from 'react';
import { Breadcrumb } from 'antd';

const App: React.FC = () => (
  <Breadcrumb
    items={[
      {
        title: 'Ant Design',
      },
      {
        title: <a href="">Component</a>,
      },
      {
        title: 'General',
        menu: {
          items: [
            {
              key: '1',
              label: (
                <a target="_blank" rel="noopener noreferrer" href="http://www.alipay.com/">
                  General
                </a>
              ),
            },
            {
              key: '2',
              label: (
                <a target="_blank" rel="noopener noreferrer" href="http://www.taobao.com/">
                  Layout
                </a>
              ),
            },
            {
              key: '3',
              label: (
                <a target="_blank" rel="noopener noreferrer" href="http://www.tmall.com/">
                  Navigation
                </a>
              ),
            },
          ],
        },
      },
      {
        title: 'Button',
      },
    ]}
  />
);

export default App;
```

4. Custom Separator
   You can change the default / separator to an arrow or any other character using the separator prop on the main component.

```jsx
import React from 'react';
import { Breadcrumb } from 'antd';

const App: React.FC = () => (
  <Breadcrumb
    separator=">"
    items={[
      {
        title: 'Home',
      },
      {
        title: 'Application Center',
        href: '',
      },
      {
        title: 'Application List',
        href: '',
      },
      {
        title: 'An Application',
      },
    ]}
  />
);

export default App;
```

5. Dynamic Integration with React Router v6
   This is the most common "real world" use case. It reads the current URL path and generates breadcrumbs automatically.

```jsx
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Breadcrumb } from "antd";

const BreadcrumbLayout = () => {
  const location = useLocation();

  // 1. Split the path (e.g. "/users/settings/profile" -> ["users", "settings", "profile"])
  const pathSnippets = location.pathname.split("/").filter((i) => i);

  // 2. Map path snippets to breadcrumb items
  const breadcrumbItems = [
    // A. Always include a "Home" link
    {
      title: <Link to="/">Home</Link>,
      key: "home",
    },
    // B. Generate the rest dynamically
    ...pathSnippets.map((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
      const title = pathSnippets[index];

      // Capitalize first letter for display
      const displayTitle = title.charAt(0).toUpperCase() + title.slice(1);

      return {
        key: url,
        title: <Link to={url}>{displayTitle}</Link>,
      };
    }),
  ];

  return (
    <div className="demo">
      <Breadcrumb items={breadcrumbItems} />
    </div>
  );
};

export default BreadcrumbLayout;
```
