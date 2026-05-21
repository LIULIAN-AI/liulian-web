'use client';

import React, { useEffect, useState } from 'react';
import { ShareholderData } from '@/app/model/staff/staff';

interface PieChartProps {
  shareholderList: ShareholderData[];
}

const PieChart: React.FC<PieChartProps> = ({ shareholderList }) => {
  const [ReactECharts, setReactECharts] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // 动态导入ECharts
    import('echarts-for-react').then((module) => {
      setReactECharts(() => module.default);
    });
  }, []);

  // 处理数据，为每个股东创建数据项
  const chartData = shareholderList.map((shareholder, index) => ({
    name: shareholder.shareholderName || 'Unknown', // 使用股东名字而不是标签
    value: shareholder.sharePercentage || 0,
    itemStyle: {
      color: getColorByIndex(index)
    }
  }));

  // 计算总持股比例
  const totalPercentage = shareholderList.reduce((sum, s) => sum + (s.sharePercentage || 0), 0);

  // 生成颜色数组
  function getColorByIndex(index: number): string {
    const colors = [
      '#FF6B6B', // 红色
      '#4ECDC4', // 青色
      '#45B7D1', // 蓝色
      '#96CEB4', // 绿色
      '#FFEAA7', // 黄色
      '#DDA0DD', // 紫色
      '#98D8C8', // 薄荷绿
      '#F7DC6F', // 金黄色
      '#BB8FCE', // 淡紫色
      '#85C1E9'  // 天蓝色
    ];
    return colors[index % colors.length];
  }

  const option = {
    title: {
      show: false // 隐藏ECharts的标题，使用原有的div11显示
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}% ({d}%)'
    },
    legend: {
      show: false // 隐藏ECharts的图例，保持原有的legends容器结构
    },
    series: [
      {
        name: '持股比例',
        type: 'pie',
        radius: ['60%', '85%'], // 进一步调大饼图尺寸
        center: ['35%', '50%'], // 将饼图移到左边居中
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: false
        },
        data: chartData
      }
    ]
  };

  // 如果不在客户端或ECharts未加载，显示加载状态
  if (!isClient || !ReactECharts) {
    return (
      <div style={{ 
        width: '100%', 
        height: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div>加载中...</div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <ReactECharts 
        option={option} 
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
};

export default PieChart; 