import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

/**
 * 空白页面组件
 * 当用户角色没有对应菜单和页面时显示
 */
const Blank: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: '#f5f5f5'
    }}>
      <Result
        status="info"
        title="暂无可用功能"
        subTitle="当前用户角色没有可访问的页面和菜单内容"
        extra={[
          <Button type="primary" key="back" onClick={() => navigate('/login')}>
            返回登录页
          </Button>
        ]}
      />
    </div>
  );
};

export default Blank;