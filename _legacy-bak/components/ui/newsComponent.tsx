import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import styles from '@/app/css/newsComponent.module.css'
// 新闻和报表组件需要的接口
import { useRouter } from 'next/navigation'
import { NewsCard, ReportCard, Page } from '@/app/model/news&report/news&report';
import { searchNewsCards, searchReportCards } from '@/app/api/news&report/news&report';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
export const EmptyList = () => (
  <div className={styles.emptyList}>
    <InfoCircleOutlined style={{fontSize: '72px', color: '#1677ff'}} />
    <div className={styles.emptyListText}>
      <div>暂无数据</div>
    </div>
  </div>
)

// Skeleton card used while news/report data is in flight. Inline-styled to
// avoid expanding the CSS module just for placeholder shapes.
const SkeletonCard = ({ height = 220 }: { height?: number }) => (
  <div
    style={{
      width: '100%',
      height,
      borderRadius: 12,
      background:
        'linear-gradient(90deg, #f1f1f1 0%, #e5e5e5 50%, #f1f1f1 100%)',
      backgroundSize: '200% 100%',
      animation: 'newsSkeletonShimmer 1.4s ease-in-out infinite',
    }}
  />
)

const emptyPage = <T,>(): Page<T> => ({
  content: [],
  numberOfElements: 0,
  totalElements: 0,
  totalPages: 0,
  number: 0,
  size: 6,
  imgType: null,
})

const NewsSkeletonGrid = () => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 40,
      width: '100%',
    }}
  >
    <style>{`@keyframes newsSkeletonShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    <SkeletonCard height={252} />
    <SkeletonCard height={252} />
    <SkeletonCard height={180} />
    <SkeletonCard height={180} />
  </div>
)

// 首字母大写，其他小写的函数
const capitalizeFirstLetter = (str: string | null | undefined): string => {
  if (!str) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const handleClick = (item:any) => {
  if(item.source){
    window.open(item.source, '_blank');
  }
};
// 正方形
const SquareRender = ({item}: {item: NewsCard}) => {
  const tags = typeof item.tag === 'string' 
    ? item.tag.split(',').map(tag => tag.trim()).filter(tag => tag) 
    : Array.isArray(item.tag) ? item.tag : [];
  return (
    <div onClick={()=>handleClick(item)} className={styles.squareRender} data-component="square">
      <Image className={styles.squareRenderImage} src={item.imgUrl || '/images/bank-info/rectangle.svg'} alt='图片' width={560} height={252} />
      <div className={styles.squareRenderContent}>
        <div className={styles.squareRenderContentTitle}>
          <div className={styles.squareRenderContentTitleTag}>
            {/* {
              tags ? tags.map(tag => (
                <div key={tag} className={styles.squareRenderContentTitleTagItem}>#{tag}</div>
              )) : (<div className={styles.squareRenderContentTitleTagItem}></div>)
            } */}
            <div className={styles.squareRenderContentTitleTagItem}>{capitalizeFirstLetter(item.type) ? `#${capitalizeFirstLetter(item.type)}` : ''}</div>
          </div>
          <div className={styles.squareRenderContentTitleDate}>{item.date}</div>
        </div>
        <div className={styles.squareRenderContentTitleTitle}>{item.title}</div>
        <div className={styles.squareRenderContentDescription}>{item.description ? item.description : ''}</div>
      </div>
    </div>
  )
}
// 长方形
const RectangleRender = ({item}: {item: NewsCard}) => {
  // 处理tag字段：如果是字符串，用逗号分割成数组；如果是数组，直接使用
  const tags = typeof item.tag === 'string' 
    ? item.tag.split(',').map(tag => tag.trim()).filter(tag => tag) 
    : Array.isArray(item.tag) ? item.tag : [];
  return (
    <div onClick={()=>handleClick(item)} className={styles.rectangleRender} data-component="rectangle">
      <Image className={styles.rectangleRenderImage} src={item.imgUrl || '/images/bank-info/defaultBackground.svg'} alt='图片' width={280} height={252} />
      <div className={styles.rectangleRenderContent}>
        <div className={styles.rectangleRenderContentTitleTitle}>{item.title}</div>
        <div className={styles.rectangleRenderContentDescription}>{item.description ? item.description : ''}</div>
        <div className={`${styles.rectangleRenderContentTitle} ${styles.rectangleRenderContentTitle}`}>
          <div className={styles.squareRenderContentTitleTag}>
            {/* {
              tags ? tags.map(tag => (
                <div key={tag} className={styles.squareRenderContentTitleTagItem}>#{tag}</div>
              )) : (<div className={styles.squareRenderContentTitleTagItem}></div>)
            } */}
            <div className={styles.squareRenderContentTitleTagItem}>{capitalizeFirstLetter(item.type) ? `#${capitalizeFirstLetter(item.type)}` : ''}</div>
          </div>
          <div className={styles.squareRenderContentTitleDate}>{item.date}</div>
        </div>
      </div>
    </div>
  )
}
// 没有图片
const NoImageRender = ({item}: {item: NewsCard}) => {
  // 处理tag字段：如果是字符串，用逗号分割成数组；如果是数组，直接使用
  const tags = typeof item.tag === 'string' 
    ? item.tag.split(',').map(tag => tag.trim()).filter(tag => tag) 
    : Array.isArray(item.tag) ? item.tag : [];
  return (
    <div className={styles.noImage} onClick={()=>handleClick(item)} data-component="rectangle">
      <div className={styles.rectangleRenderContentTitleTitle}>{item.title}</div>
      <div className={`${styles.rectangleRenderContentTitle} ${styles.rectangleRenderContentTitle}`}>
        <div className={styles.squareRenderContentTitleTag}>
          {/* {
            tags ? tags.map(tag => (
              <div key={tag} className={styles.squareRenderContentTitleTagItem}>#{tag}</div>
            )) : (<div className={styles.squareRenderContentTitleTagItem}></div>)
          } */}
          <div className={styles.squareRenderContentTitleTagItem}>{capitalizeFirstLetter(item.type) ? `#${capitalizeFirstLetter(item.type)}` : ''}</div>
        </div>
        <div className={styles.squareRenderContentTitleDate}>{item.date}</div>
      </div>
    </div>
  )
}

// report展示组件
const ReportCardComponent = ({item, index} : {item:any, index:number}) => {
  const [day, month, year] = item.updateDate ? item.updateDate.split(' '): ['', '', '']
  const tags = typeof item.tag === 'string'
    ? item.tag.split(',').map((tag:any) => tag.trim()).filter((tag:any) => tag)
    : Array.isArray(item.tag) ? item.tag : [];
  return (
    <div key={'repm_' + index} className={styles.reportCard}>
      <div className={styles.reportCardLeft}>
        <div className={styles.reportCardLeftDay}>{day}</div>
        <div className={styles.reportCardLeftYearMonth}>
          <div className={styles.reportCardLeftMonth}>{month}</div>
          <div className={styles.reportCardLeftYear}>{year}</div>
        </div>
      </div>
      <div className={styles.reportCardRight}>
        <Image src={item.imgUrl || '/images/news&report/pdfBackground.svg'} alt={item.title} className={styles.newsReportCardRightImage} width={45.091} height={60.364} />
      </div>
      <div className={styles.reportCardMiddle}>
        <div className={styles.reportCardMiddleTitle}>{item.description}</div>
        <div className={styles.reportCardMiddleTag}>
          {
            item.tag && (<div className={styles.reportCardMiddleTagItem}>#{item.tag}</div>)
            // tags.length > 0 && tags.map((tag:any) => (
            //   <div key={tag} className={styles.reportCardMiddleTagItem}>#{tag}</div>
            // ))
          }
        </div>
      </div>
    </div>
  )
}
// 简化的瀑布流布局钩子
const useMasonryLayout = (squareWidth: number = 560, gap: number = 40) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const reorganizeMasonry = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const items = Array.from(container.children) as HTMLElement[];
    
    // 重置容器样式
    container.style.height = 'auto';
    
    // 获取容器宽度
    const containerWidth = container.clientWidth;
    
    // 检查是否存在squareRender元素
    const hasSquareRender = items.some(item => item.dataset.component === 'square');
    
    if (hasSquareRender) {
      // 如果有squareRender，采用不对称布局
      // 先找到square元素，确定它所在的列
      const squareItems = items.filter(item => item.dataset.component === 'square');
      // 确定列宽规则：根据square元素的位置决定哪一列固定560px
      let firstColumnWidth, secondColumnWidth;
      if (squareItems.length > 0) {
        // 有square元素时，采用智能分配策略
        // 先进行一轮预分配，确定square元素会分配到哪一列
        const tempColumnHeights = [0, 0];
        let squareTargetColumn = 0;
        
        // 模拟分配过程，确定square元素会分配到哪一列
        items.forEach((item) => {
          const targetColumn = tempColumnHeights[0] <= tempColumnHeights[1] ? 0 : 1;
          if (item.dataset.component === 'square') {
            squareTargetColumn = targetColumn;
          }
          tempColumnHeights[targetColumn] += item.offsetHeight + gap;
        });
        
        // 根据square元素所在的列设置列宽
        if (squareTargetColumn === 0) {
          // square元素在第一列：第一列固定560px，第二列自适应
          firstColumnWidth = squareWidth;
          secondColumnWidth = containerWidth - squareWidth - gap;
        } else {
          // square元素在第二列：第二列固定560px，第一列自适应
          secondColumnWidth = squareWidth;
          firstColumnWidth = containerWidth - squareWidth - gap;
        }
      } else {
        // 没有square元素时，两列均分宽度
        const availableWidth = containerWidth - gap;
        firstColumnWidth = availableWidth / 2;
        secondColumnWidth = availableWidth / 2;
      }
      
      // 初始化两列的高度
      const columnHeights = [0, 0];
      
      // 瀑布流算法：所有元素根据高度动态分配到合适的列
      items.forEach((item, index) => {
        const targetColumn = columnHeights[0] <= columnHeights[1] ? 0 : 1;
        
        // 根据目标列设置正确的宽度
        let itemWidth;
        if (targetColumn === 0) {
          itemWidth = firstColumnWidth;
        } else {
          itemWidth = secondColumnWidth;
        }
        
        // 设置元素宽度和位置
        item.style.position = 'absolute';
        item.style.boxSizing = 'border-box';
        item.style.width = `${itemWidth}px`;
        
        const left = targetColumn === 0 ? 0 : firstColumnWidth + gap;
        const top = columnHeights[targetColumn];
        
        item.style.left = `${left}px`;
        item.style.top = `${top}px`;
        // 更新列高
        columnHeights[targetColumn] += item.offsetHeight + gap;
      });
      
      container.style.minHeight = `${Math.max(...columnHeights) - gap}px`;
    } else {
      // 如果没有squareRender，两列平分宽度
      // 修复宽度计算：确保每列宽度合理，并处理边界情况
      const minColumnWidth = 280; // 最小列宽，避免过窄
      const availableWidth = containerWidth - gap;
      if(availableWidth < minColumnWidth * 2){
        const columnWidth = Math.min(availableWidth, 560);
        // 先设置宽度计算高度
        items.forEach(item => {
          item.style.position = 'static';
          item.style.boxSizing = 'border-box';
          item.style.width = `${columnWidth}px`;
          item.style.opacity = '0';
        });
        container.offsetHeight;
        const itemHeights = items.map(item => {
        const height = item.offsetHeight;
          item.style.position = 'absolute';
          item.style.opacity = '1';
          return height;
        });
          // 单列布局：所有元素放在同一列
        let currentHeight = 0;
        items.forEach((item, index) => {
          item.style.left = '0px';
          item.style.top = `${currentHeight}px`;
          currentHeight += itemHeights[index] + gap;
        });
        container.style.minHeight = `${currentHeight - gap}px`;
      } else {
        // 双列布局
        const columnWidth = availableWidth / 2;
        const columnHeights = [0, 0];
         // 先设置宽度计算高度
        items.forEach(item => {
          item.style.position = 'static';
          item.style.boxSizing = 'border-box';
          item.style.width = `${columnWidth}px`;
          item.style.opacity = '0';
        });
        container.offsetHeight;
        const itemHeights = items.map(item => {
          const height = item.offsetHeight;
          item.style.position = 'absolute';
          item.style.opacity = '1';
          return height;
        });
        items.forEach((item, index) => {
          const targetColumn = columnHeights[0] <= columnHeights[1] ? 0 : 1;
          const left = targetColumn * (columnWidth + gap);
          const top = columnHeights[targetColumn];
          item.style.left = `${left}px`;
          item.style.top = `${top}px`;
          columnHeights[targetColumn] += itemHeights[index] + gap;
        });
        container.style.minHeight = `${Math.max(...columnHeights) - gap}px`;
      }
    }
  }, [squareWidth, gap]);
  
  useEffect(() => {
    reorganizeMasonry();
    // 使用 ResizeObserver 监听尺寸变化
    const resizeObserver = new ResizeObserver(reorganizeMasonry);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [reorganizeMasonry]);
  
  return { containerRef, reorganizeMasonry };
};
export default function NewsComponent() {
  const router = useRouter();
  const t = useTranslations('HomePage');
  // const containerRef = useRef<HTMLDivElement>(null);
  const { containerRef: masonryRef, reorganizeMasonry } = useMasonryLayout(560, 40);
  const [news, setNews] = useState<Page<NewsCard>>({
    content: [],
    numberOfElements: 0,
    totalElements: 0,
    totalPages: 0,
    size: 6,
    number: 0,
    imgType: null
  })
  const [report, setReport] =  useState<Page<ReportCard>>({ 
    content: [], 
    numberOfElements: 0,
    totalElements: 0,
    totalPages: 0,
    size: 6,
    number: 0,
    imgType: null
  })
  const [defaultActive, setDefaultActive] = useState(1)
  // Initial true so the first paint shows a skeleton instead of the
  // EmptyList ("暂无数据") flash before initNews resolves. Issue #38.
  const [loading, setLoading] = useState(true)
  const newsTab = [{
    name: t('recentNews'),
    value: 1
  },{
    name: t('researchReports'),
    value: 2
  }]
  const initRefreshNews = async () => {
    setLoading(true)
    try{
      const res = await searchNewsCards({ page: 0, size: 6 })
      setNews(res || emptyPage<NewsCard>())
    } catch (err){
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false)
    }
  }
  // 初始化页面时，获取新闻数据
  const initNews = useCallback(async () => {
    setLoading(true)
    try{
      const res = await searchNewsCards({ page: 0, size: 7 })
      setNews(res || emptyPage<NewsCard>())
    } catch (err){
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false)
    }
  }, [defaultActive])
  const initRefreshReport = async () => {
    setLoading(true)
    try{
      const res = await searchReportCards({ page: 0, size: 7 })
      setReport(res || emptyPage<ReportCard>())
    } catch (err){
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false)
    }
  }
  // 初始化报表数据
  const initReport = useCallback(async () => {
    setLoading(true)
    try{
      const res = await searchReportCards({ page: 0, size: 7 })
      setReport(res || emptyPage<ReportCard>())
    } catch (err){
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false)
    }
  }, [defaultActive])
  // 数据加载后重新组织瀑布流
  useEffect(() => {
    if ((news && news.numberOfElements > 0) || (report && report.numberOfElements > 0)) {
      // 给DOM更新一点时间
      setTimeout(() => {
        reorganizeMasonry();
      }, 0);
    }
  }, [news, report, defaultActive, reorganizeMasonry]);
  useEffect(() => {
    if(defaultActive == 1){
      initNews()
    } else if(defaultActive == 2){
      initReport()
    }else{
      initNews()
    }
  }, [defaultActive])
  return (
    <div className={styles.newsContent}>
      <div className={styles.newsContentTop}>
        <div className={styles.newsContentTopTab}>
          {
            newsTab.map((item, index) => (
              <div onClick={() => setDefaultActive(item.value)} key={index} className={`${styles.newsContentTopTabItem} ${item.value === defaultActive ? styles.newsContentTopTabItemActive : ''}`}>
                {item.name}
              </div>
            ))
          }
        </div>
        <div className={styles.newsContentTopRefresh}>
          <Image onClick={() => {
            if(defaultActive == 1){
              initRefreshNews()
            } else if(defaultActive == 2){
              initRefreshReport()
            }else{
              initRefreshNews()
            }
          }} src="/images/homepage/refresh.svg" alt="arrowRight" width={20} height={20} />
        </div>
      </div>
      <div className={styles.newsContentMiddle}>
        {
          defaultActive == 1 ? (
            loading ? (
              <NewsSkeletonGrid />
            ) : (
              <div className={styles.rectangleNoImage} ref={masonryRef}>
                {
                  news && news?.numberOfElements && news?.numberOfElements > 0 ? (news.content.map((item:any, index) => (
                    news.imgType === 1 ? <SquareRender key={index} item={item} /> : news.imgType === 2 ? <RectangleRender key={index} item={item} /> : <NoImageRender key={index} item={item} />
                  ))) : (<EmptyList></EmptyList>)
                }
              </div>
            )
          ) : defaultActive == 2 ? (
            loading ? (
              <NewsSkeletonGrid />
            ) : (
              <div key={'rep_' + defaultActive} className={styles.rectangleNoImage}>
                {
                  report && report?.numberOfElements && report?.numberOfElements > 0 ? (report.content.map((item:any, index) => (
                    <ReportCardComponent key={'rep_' + index} index={index} item={item} />
                  ))) : (<EmptyList></EmptyList>)
                }
              </div>
            )
          ) : (loading ? <NewsSkeletonGrid /> : <EmptyList></EmptyList>)
        }
      </div>
      <div className={styles.newsContentBottom}>
        <div className={styles.newsContentBottomTitle}>{t('accessRealTimeNewsAndReports')}</div>
        <div className={styles.newsContentBottomLink}>
          <div onClick={() => router.push('/news&report')} className={styles.newsContentBottomText}>{t('readMore')}</div>
          <Image src="/images/homepage/arrowRight.svg" alt="arrowRight" width={16} height={16} />
        </div>
      </div>
    </div>
  )
}