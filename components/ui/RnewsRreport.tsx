'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { Empty, DatePicker, Space, Select, Button } from "antd";
import dayjs from 'dayjs';
import '@/app/css/news.css'
import type { DefaultOptionType } from 'antd/es/select';
import EmptyList from '@/components/ui/EmptyList';
import pageData from '@/public/news&report.json';
import { searchNewsCards, searchReportCards } from '@/app/api/news&report/news&report';
import type { NewsCard, ReportCard, Page } from '@/app/model/news&report/news&report';

// 默认分页对象
const defaultNewsPage: Page<NewsCard> = {
  content: [],
  numberOfElements: 0,
  totalPages: 0,
  totalElements: 0,
  size: 0,
  number: 0,
};

const defaultReportPage: Page<ReportCard> = {
  content: [],
  numberOfElements: 0,
  totalPages: 0,
  totalElements: 0,
  size: 0,
  number: 0,
};

const defaultNewsFilter = { region: '', type: '', startDate: '', endDate: '' };
const defaultReportFilter = { region: '', year: '', companySortId: '' };

const RnewsRreport: React.FC = () => {
  const [allNews, setAllNews] = useState<Page<NewsCard>>(defaultNewsPage);
  const [allReports, setAllReports] = useState<Page<ReportCard>>(defaultReportPage);
  const [page] = useState(0);
  const [size] = useState(5);
  const [selectedTab, setSelectedTab] = useState<'news' | 'report'>('news');
  const [newsFilter, setNewsFilter] = useState({ ...defaultNewsFilter });
  const [reportFilter, setReportFilter] = useState({ ...defaultReportFilter });
  const [showFilter, setShowFilter] = useState(false);
  const { RangePicker } = DatePicker;

  // 首次加载
  useEffect(() => {
    handleResetFilter('news');
    // eslint-disable-next-line
  }, []);

  // 加载数据
  const loadData = useCallback(async (
    selectedTab: 'news' | 'report',
    newsFilter: typeof defaultNewsFilter,
    reportFilter: typeof defaultReportFilter
  ) => {
    if (selectedTab === 'news') {
      try {
        const newNews: Page<NewsCard> = await searchNewsCards({
          page,
          size,
          region: newsFilter.region,
          type: newsFilter.type,
          startDate: newsFilter.startDate,
          endDate: newsFilter.endDate,
        });
        if (newNews.numberOfElements > 0) {
            setAllNews(newNews);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    } else {
      try {
        const newReports: Page<ReportCard> = await searchReportCards({
          page,
          size,
          region: reportFilter.region,
          year: reportFilter.year,
          companySortId: reportFilter.companySortId,
        });
        if (newReports.numberOfElements > 0) {
            setAllReports(newReports);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    }
  }, [page, size]);

  // 选项卡切换
  const handleTabChange = (tab: 'news' | 'report') => {
    setSelectedTab(tab);
    setShowFilter(false);
    handleResetFilter(tab);
  };

  // 重置筛选
  const handleResetFilter = async (tab?: 'news' | 'report') => {
    setNewsFilter({ ...defaultNewsFilter });
    setReportFilter({ ...defaultReportFilter });
    setAllNews(defaultNewsPage);
    setAllReports(defaultReportPage);
    await loadData(tab || selectedTab, defaultNewsFilter, defaultReportFilter);
  };

  // 验证筛选
  const handleVerifyFilter = async () => {
    setAllNews(defaultNewsPage);
    setAllReports(defaultReportPage);
    setShowFilter(false);
    await loadData(selectedTab, newsFilter, reportFilter);
  };

  return (
    <div style={{ width: '100%',position: 'relative', zIndex: 0}}>

      <div className='news-report-container'>
        {/* 选项栏 */}
        <div className="filter-container">
          <div className="filter-header-container">
            <div className='tabs-container'>
              <button className={`tab-container ${selectedTab === 'news' ? 'active' : ''}`} onClick={() => handleTabChange('news')}>
                <div className='tab'>Recent News</div>
              </button>
              <button className={`tab-container ${selectedTab === 'report' ? 'active' : ''}`} onClick={() => handleTabChange('report')}>
                <div className='tab'>Research Reports</div>
              </button>
            </div>
            <button className={`button-container ${showFilter ? 'active' : ''}`} onClick={() => setShowFilter(!showFilter)}>
              <div className='button'><img src="/images/news&report/filter.png" /></div>
            </button>
          </div>

          {/* 筛选组件 */}
          {showFilter && selectedTab === 'news' && (
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
          )}
          {showFilter && selectedTab === 'report' && (
            <div className='filter-content-container2'>
              <div className='selections-container'>
                <Select
                  showSearch
                  className='selection-container'
                  placeholder="Select a region"
                  optionFilterProp="label"
                  value={reportFilter.region}
                  onChange={(value: string) => setReportFilter({ ...reportFilter, region: value })}
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
                <Space direction="vertical" size={12}>
                  <DatePicker
                    className='date-selection-container'
                    value={reportFilter.year ? dayjs(reportFilter.year) : null}
                    onChange={(date, dateStrings) => {
                      setReportFilter({
                        ...reportFilter,
                        year: Array.isArray(dateStrings) ? dateStrings.join('') : dateStrings || ''
                      });
                    }}
                    picker='year'
                  />
                </Space>
                <Select
                  showSearch
                  className='selection-container'
                  placeholder="Select a company"
                  optionFilterProp="label"
                  value={reportFilter.companySortId}
                  onChange={(value: string) => setReportFilter({ ...reportFilter, companySortId: value })}
                  filterSort={(
                    optionA: DefaultOptionType,
                    optionB: DefaultOptionType
                  ) =>
                    (optionA?.label ?? '').toString().toLowerCase().localeCompare(
                      (optionB?.label ?? '').toString().toLowerCase()
                    )
                  }
                  options={pageData.companyOptions}
                />
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
          )}
        </div>

        {/* 内容区 */}
        {selectedTab === 'news' && (
          <div className="news-list-container">
            {allNews.numberOfElements === 0 ? (
              <EmptyList />
            ) : (
              <ul>
                {allNews.content.slice(0, 5).map((news) => (
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
        )}
        {selectedTab === 'report' && (
          <div className="news-list-container">
            {allReports.numberOfElements === 0 ? (
              <EmptyList />
            ) : (
              <ul>
                {allReports.content.slice(0, 5).map((report) => (
                  <ShowReportCard
                    key={report.name}
                    name={report.name}
                    companyName={report.companyName}
                    year={report.year}
                    link={report.link}
                  />
                ))}
              </ul>
            )}
          </div>
        )}

        <Button style={{
            margin: '0 auto',
            width: '340px', height: '30px',
            fontWeight: 400,
            fontSize: '20px',
            lineHeight: '30px',
            letterSpacing: '0%',
            color: '#7F1F1D'

        }} color="red" variant="link" onClick={()=>handleResetFilter()}>
            Access Real-Time News and Reports
        </Button>

        <Button style={{
            marginTop: '20px',
            marginLeft: 'auto',
            marginRight: 'auto',
            width: '139px', height: '40px', borderRadius: '6px',
            paddingTop: '8px',
            paddingRight: '16px',
            paddingBottom: '8px',
            paddingLeft: '16px',
            gap: '8px',
            fontSize: '16px',
            fontWeight: '500',
            lineHeight: '22px',
            letterSpacing: '0px',
            color: '#18181B'
        }} color="default" variant="filled" icon = {<img style={{height: '16px', width: '16px'}} src='/images/news&report/outline.png' />} iconPosition='end' href='/news&report'>
            Read More
        </Button>
      </div>
    </div>
  );
};

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
              {/* {tag && tag.length > 0 && tag.slice(0, 3).map((badge) => (
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

const ShowReportCard: React.FC<ReportCard> = ({ name, companyName, year, link }) => {
  const handleClick = () => {
    window.open(link, '_blank');
  };

  return (
    <div className='news-card' onClick={handleClick}>
      <div className='year-container'>
        <div className='year'>
          <h2>{year?.substring(year.length - 5, year.length)}</h2>
        </div>
      </div>
      <div className='right-container'>
        <div className='words-container'>
          <div className="title-container">
            <div className="title">
              <h2>{name}</h2>
            </div>
          </div>
          <div className="news-content-container">
            <p className='company'>{companyName}</p>
          </div>
        </div>
        <img className='img-container2' src={"/images/news&report/pdf.png"} alt={name} />
      </div>
    </div>
  );
};

export default RnewsRreport;