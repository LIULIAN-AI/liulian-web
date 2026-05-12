// <News/> 或者传递可选参数  <News type="Marketing" />，type取值为:Compliance, Financials, Marketing, Product, Staff, Tech, Web3
import { searchNewsCards } from "@/app/api/news&report/news&report";
import { NewsCard, Page } from "@/app/model/news&report/news&report";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import styles from '@/app/css/news.module.css'
import '@/app/css/news.css'
import dayjs from 'dayjs';
import { Empty, Result, DatePicker, Space, Select, Pagination } from "antd";
import type { PaginationProps } from 'antd';
import { DefaultOptionType } from "antd/es/select";
import pageData from '@/public/news&report.json';
import EmptyList from "./EmptyList";
const { RangePicker } = DatePicker;


interface NewsProps {
    companySortId?: string;
    type?: string;
}

const defaultNewsPage: Page<NewsCard> = {
    content: [],
    numberOfElements: 0,
    totalPages: 0,
    totalElements: 0,
    size: 0,
    number: 0,
};

const defaultNewsFilter = { region: '', type: '', startDate: '', endDate: '' };




const News = ({ companySortId, type: defaultType }: NewsProps) => {
    const [allNews, setAllNews] = useState<Page<NewsCard>>(defaultNewsPage);
    const [newsFilter, setNewsFilter] = useState({ ...defaultNewsFilter });
    const [showFilter, setShowFilter] = useState(false);
    const [page, setPage] = useState(0);

    const params = useParams();
    const sortId = params?.sortId?.toString() ?? '';

    // 首次加载
    useEffect(() => {
            // 初始化筛选条件：如果有默认type则设置
            const initialFilter = defaultType
                ? { ...defaultNewsFilter, type: defaultType }
                : defaultNewsFilter;

            handleResetFilter(initialFilter);
            // eslint-disable-next-line
        }, [defaultType]);

    const handleUpdate = useCallback(async (
        page: number,
        size: number,
        newsFilter: typeof defaultNewsFilter
      ) => {
          try {
            const newNews: Page<NewsCard> = await searchNewsCards({
              page: page,
              size: size,
              region: newsFilter.region,
              type: newsFilter.type,
              startDate: newsFilter.startDate,
              endDate: newsFilter.endDate,
              companySortId: companySortId || sortId,
            });

            if (newNews.numberOfElements > 0) {
                setAllNews(newNews);
            }
            console.log(`第${page+1}页数据:`, newNews.content.length);

          } catch (error) {
            console.error('Error fetching more news:', error);
          }
      }, [allNews.numberOfElements, companySortId, sortId]);

   const handleResetFilter = async (initialFilter: typeof defaultNewsFilter = defaultNewsFilter) => {
     setNewsFilter(initialFilter); // 使用传入的筛选条件（可能包含type）
     setPage(0);
     setAllNews(defaultNewsPage);
     await handleUpdate(0, 3, initialFilter); // 基于传入的条件请求数据
   };

    // 验证筛选
    const handleVerifyFilter = async () => {
      setPage(0);
      setAllNews(defaultNewsPage);
      await handleUpdate(0, 3, newsFilter);
    };

    const handlePageChange: PaginationProps['onChange'] = (page) => {
      setPage(page - 1);
      console.log("page " + page)
//       setAllNews(defaultNewsPage);
      // 延迟执行，确保清空后再请求新数据（可选）
        setTimeout(() => {
          handleUpdate(page - 1, 3, newsFilter);
        }, 0);
    };

    return (
        <div style={{width: '100%'}}>
            <div className={styles.recentNewsContainer}>
                <div className={styles.recentNewsHeaderContainer}>
                    <div className={styles.headerContainer}>
                        <div className={styles.fontContainer}>
                            <h4>Recent News</h4>
                        </div>

                        <button className={`${styles['buttonContainer']} ${showFilter ? styles['active'] : ''}`} onClick={() => setShowFilter(!showFilter)}>
                            <div className={styles.button}><img src="/images/news&report/filter.png" /></div>
                        </button>
                    </div>
                </div>

            {showFilter && (
                <div className="filter-container ">
                <div className='filter-content-container'>
                    <div className='selections-container'>
                        <Select
                        showSearch
                        className='selection-container'
                        placeholder="Select a region"
                        optionFilterProp="label"
                        value={newsFilter.region}
                        onChange={(value: string) => setNewsFilter({ ...newsFilter, region: value })}
                        filterSort={(
                            optionA: DefaultOptionType,
                            optionB: DefaultOptionType
                        ) =>
                            (optionA?.label ?? '').toString().toLowerCase().localeCompare(
                            (optionB?.label ?? '').toString().toLowerCase()
                            )
                        }
                        options={pageData.regionOptions}
                        />
                        <Select
                        showSearch
                        className='selection-container'
                        placeholder="Select a type"
                        optionFilterProp="label"
                        value={newsFilter.type}
                        onChange={(value: string) => setNewsFilter({ ...newsFilter, type: value })}
                        filterSort={(
                            optionA: DefaultOptionType,
                            optionB: DefaultOptionType
                        ) =>
                            (optionA?.label ?? '').toString().toLowerCase().localeCompare(
                            (optionB?.label ?? '').toString().toLowerCase()
                            )
                        }
                        options={pageData.typeOptions}
                        />
                        <Space direction="vertical" size={12}>
                        <RangePicker
                            className='date-selection-container'
                            value={[
                                newsFilter.startDate ? dayjs(newsFilter.startDate) : null,
                                newsFilter.endDate ? dayjs(newsFilter.endDate) : null
                            ]}
                            onChange={(dates, dateStrings) => setNewsFilter({
                            ...newsFilter,
                            startDate: dateStrings[0],
                            endDate: dateStrings[1]
                            })}
                        />
                        </Space>
                    </div>
                    <div className='buttons-container'>
                        <button className='button-container' onClick={() => handleResetFilter()}>
                        <div className='button-img'>
                            <img src="/images/news&report/vector.png" />
                        </div>
                        <div className='button-text'>
                            <p>Reset</p>
                        </div>
                        </button>
                        <button className='button-container' style={{ backgroundColor: '#000000' }} onClick={handleVerifyFilter}>
                        <div className='button-img'>
                            <img src="/images/news&report/vector-white.png" />
                        </div>
                        <div className='button-text' style={{ color: '#FAFAFA' }}>
                            <p>Verify</p>
                        </div>
                        </button>
                    </div>
                </div>
                </div>
            )}

                <div className="news-list-container">
                    {allNews.numberOfElements === 0 ? (
                        <EmptyList />
                    ) : (
                        <ul>
                        {allNews.content.map((news) => (
                            <ShowNewsCard
                            key={news.title}
                            title={news.title}
                            authority={news.authority}
                            date={news.date}
                            dateTag={news.dateTag}
                            source={news.source}
                            tag={news.tag}
                            imgUrl={news.imgUrl}
                            />
                        ))}
                        </ul>
                    )}
                </div>
                <Pagination align="center" current={page + 1} onChange={handlePageChange} total={allNews.totalElements} pageSize={3} showSizeChanger={false}/>
            </div>
        </div>
    )
}

// 新闻卡片
const ShowNewsCard: React.FC<NewsCard> = ({ title, authority, date, dateTag, source, tag, imgUrl }) => {
    const [day, month, year] = date.split(' ');
    dateTag = dateTag || 'Today';
    tag = tag || ['Financial', 'Report'];

    const handleClick = () => {
      window.open(source, '_blank');
    };

    return (
      <div className="news-card" onClick={handleClick}>
        <div className="date-container">
          <div className="day-container">
            {dateTag && (
              <div className="date-tag-container">
                <span className="dot"></span>
                <div className="date-tag">{dateTag}</div>
              </div>
            )}
            <div className="day">{day}</div>
          </div>
          <div className="month-year">{month} {year}</div>
        </div>
        <div className="right-container">
          <div className='words-container'>
            <div className="title-container">
              <div className="title">
                <h2>{title}</h2>
              </div>
            </div>
            <div className="news-content-container">
              <div className="badges-container">
                {/* {tag && tag.length > 0 && tag.map((badge) => (
                  <div className='badge-container' key={badge}>
                    <div className='dot'></div>
                    <div className='text'>{badge}</div>
                  </div>
                ))} */}
              </div>
              <div className='authority-container'>
                <div className='authority'>
                  <p>{authority}</p>
                </div>
              </div>
            </div>
          </div>
          <img className='img-container' src={imgUrl ? imgUrl : "/images/news&report/news-default.png"} alt={title} />
        </div>
      </div>
    );
  };

export default News;
