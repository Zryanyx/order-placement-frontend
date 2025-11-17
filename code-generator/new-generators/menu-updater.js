const fs = require('fs');
const path = require('path');

class MenuUpdater {
  static async update(modules, project, projectRoot) {
    const layoutPath = path.join(projectRoot, project.basePath, 'components', 'Layout.tsx');
    
    if (!fs.existsSync(layoutPath)) {
      console.log('⚠️  布局文件不存在，跳过菜单更新');
      return;
    }

    console.log('📊 开始更新菜单配置...');
    
    // 读取现有布局文件
    let layoutContent = fs.readFileSync(layoutPath, 'utf8');
    
    // 生成菜单项代码
    const menuItemsCode = this.generateMenuItems(modules);
    
    // 查找并替换菜单项
    const menuRegex = /(const menuItems = \[)([\s\S]*?)(\];)/;
    
    if (menuRegex.test(layoutContent)) {
      layoutContent = layoutContent.replace(menuRegex, `$1${menuItemsCode}$3`);
      console.log('✅ 菜单项已更新');
    } else {
      // 如果找不到菜单项，在合适的位置插入
      const insertPoint = layoutContent.indexOf('const menuItems = [');
      if (insertPoint !== -1) {
        const before = layoutContent.substring(0, insertPoint);
        const after = layoutContent.substring(insertPoint);
        
        // 找到第一个匹配的]
        const endIndex = after.indexOf('];');
        if (endIndex !== -1) {
          const newContent = before + 'const menuItems = [' + menuItemsCode + after.substring(endIndex);
          layoutContent = newContent;
          console.log('✅ 菜单项已插入');
        }
      }
    }
    
    // 写入更新后的文件
    fs.writeFileSync(layoutPath, layoutContent);
    console.log(`📄 布局文件已更新: ${layoutPath}`);
  }

  // 生成菜单项代码
  static generateMenuItems(modules) {
    // 按菜单层级分组
    const menuGroups = {};
    
    modules.forEach(module => {
      const menuLevel = module.menuLevel || 'admin';
      if (!menuGroups[menuLevel]) {
        menuGroups[menuLevel] = [];
      }
      menuGroups[menuLevel].push(module);
    });

    let menuItemsCode = '';

    // 管理员菜单
    if (menuGroups.admin && menuGroups.admin.length > 0) {
      menuItemsCode += `
    // 管理员菜单
    {
      key: 'admin',
      label: '管理员菜单',
      icon: <SettingOutlined />,
      children: [
`;
      
      menuGroups.admin.forEach(module => {
        const moduleName = module.name;
        const camelCaseName = this.toCamelCase(moduleName);
        
        menuItemsCode += `        {
          key: '${camelCaseName}',
          label: '${module.comment}',
          onClick: () => navigate('/admin/${camelCaseName}')
        },
`;
      });
      
      menuItemsCode += `      ]
    },
`;
    }

    // 用户菜单
    if (menuGroups.user && menuGroups.user.length > 0) {
      menuItemsCode += `
    // 用户菜单
    {
      key: 'user',
      label: '用户菜单',
      icon: <UserOutlined />,
      children: [
`;
      
      menuGroups.user.forEach(module => {
        const moduleName = module.name;
        const camelCaseName = this.toCamelCase(moduleName);
        
        menuItemsCode += `        {
          key: '${camelCaseName}',
          label: '${module.comment}',
          onClick: () => navigate('/user/${camelCaseName}')
        },
`;
      });
      
      menuItemsCode += `      ]
    },
`;
    }

    // 公共菜单
    if (menuGroups.common && menuGroups.common.length > 0) {
      menuGroups.common.forEach(module => {
        const moduleName = module.name;
        const camelCaseName = this.toCamelCase(moduleName);
        
        menuItemsCode += `
    // 公共菜单
    {
      key: '${camelCaseName}',
      label: '${module.comment}',
      icon: <AppstoreOutlined />,
      onClick: () => navigate('/${camelCaseName}')
    },
`;
      });
    }

    // 添加默认菜单项
    menuItemsCode += `
    // 默认菜单项
    {
      key: 'products',
      label: '商品列表',
      icon: <ShoppingOutlined />,
      onClick: () => navigate('/products')
    },
`;

    return menuItemsCode;
  }

  static toCamelCase(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }
}

module.exports = MenuUpdater;