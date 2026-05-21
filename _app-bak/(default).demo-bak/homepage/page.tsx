'use client';
import { FunctionComponent, useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Input, InputRef } from 'antd';
import NewsComponent from "@/components/ui/newsComponent";
import PopularBanks from "@/components/popularBanks";
import UserAccountMenu from "@/components/UserAccountMenu";
import PortalPopup from "@/components/PortalPopup";
// import Clients from "@/components/clients"
import BankMenuOption, { Company } from '@/components/BankMenuOption';
import styles from './home.module.css';
import { useRouter } from 'next/navigation'; // Next.js 13+ 路由路径
import { useAuth } from '@clerk/nextjs';
import { CompilationMonitor } from '@/utils/compilationMonitor';
// swiper测试
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

import { getSearchWordsByUser, getOurPartner } from '@/app/api/homepage';
import { config } from '@/config/environment';
import { resolveAssetUrl } from '@/utils/resolveAssetUrl';
import { filterHomepageHotSearchWords } from '@/utils/homepageHotSearchFilter';

// 引入IndexedDBUtil
import IndexedDBUtil from "@/utils/indexedDb";
import { useTranslations } from 'next-intl';
interface HotSearchWord {
  keyword: string;
  searchType: string;
  searchCount: number;
  logoUrl: string;
  iconType: string;
  displayName: string;
  description: string;
}

interface PartnerItem {
  createdAt: string;
  description: string;
  id: string;
  logoLink: string;
  name: string;
  status: string;
  type: string;
  updatedAt: string;
  websiteLink: string;
}

const SwiperCarousel: React.FC = () => {
  const [partnerList, setPartnerList] = useState<PartnerItem[]>([]);
  const [failedPartnerLogoKeys, setFailedPartnerLogoKeys] = useState<Set<string>>(new Set());

  const handlePartnerLogoError = useCallback((partnerKey: string) => {
    setFailedPartnerLogoKeys((previous) => {
      if (previous.has(partnerKey)) {
        return previous;
      }
      const next = new Set(previous);
      next.add(partnerKey);
      return next;
    });
  }, []);

  const initPartner = useCallback(async () => {
    try {
      const response = await getOurPartner();
      const normalizedPartnerList: PartnerItem[] = Array.isArray(response)
        ? response.map((partner: PartnerItem) => ({
            ...partner,
            logoLink: resolveAssetUrl(partner.logoLink, config.backendApiUrl),
          }))
        : [];

      setFailedPartnerLogoKeys(new Set());
      setPartnerList(normalizedPartnerList);
    } catch (error) {
      console.error('Failed to fetch partners:', error);
      setFailedPartnerLogoKeys(new Set());
      setPartnerList([]);
    }
  }, [])
  useEffect(() => {
    initPartner();
  }, [initPartner])
  return (
    <div className="swiper-container" style={{ width: '100%', paddingTop:'30px' }}>
      <Swiper
        // 引入所需模块
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        // 配置选项
        spaceBetween={32}
        slidesPerView={3}
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        pagination={false}
        breakpoints={{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
        // 事件监听
        onSlideChange={(swiper) => {
        }}
        onSwiper={(swiper) => {
          console.log('Swiper initialized: ', swiper);
        }}
      >
        {partnerList.map((slide, index) => {
          const partnerKey = slide.id || slide.name || `partner-${index}`;
          const logoSource = failedPartnerLogoKeys.has(partnerKey) || !slide.logoLink
            ? '/images/defaultBank.svg'
            : slide.logoLink;

          return (
            <SwiperSlide className={styles.swiperSlide} key={partnerKey}>
              <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <img
                  src={logoSource}
                  alt={slide.name || 'Partner logo'}
                  onError={() => handlePartnerLogoError(partnerKey)}
                  style={{
                    // objectFit: 'contain', // 保持图片比例
                    height: '50px'
                  }}
                />
              </div>
            </SwiperSlide>
          );
        })}
        <div className="swiper-pagination" />
      </Swiper>
    </div>
  );
};
const Partner = ({partner}:{partner:string}) => {
  return (
    <div className={styles.similarCompany}>
      <div className={styles.similarCompanyTitle}>
        {partner}
      </div>
      <SwiperCarousel />
    </div>
  )
}
const Page:FunctionComponent = () => {
  const t = useTranslations('HomePage');
  // 新的代码
  const videoRef:any = useRef(null);
  const router = useRouter(); // 替换 useNavigate()
  const { getToken } = useAuth();
  // 搜索历史相关状态
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const indexedDB = useRef(new IndexedDBUtil('searchDB', 'searchHistory')).current;
  // 保存搜索历史
  const saveSearchHistory = useCallback(async (keyword: string) => {
    if (!keyword.trim()) return;
    try {
      console.log('保存搜索历史:', keyword);
      const existingHistory = await indexedDB.getData('searchHistory');
      console.log('现有搜索历史:', existingHistory);
      // getData已经直接返回了data字段的值，不需要再访问.data
      const history = existingHistory || [];
      const filteredHistory = history.filter((item: string) => item !== keyword);
      filteredHistory.unshift(keyword);
      const limitedHistory = filteredHistory.slice(0, 5);
      // 直接传递limitedHistory作为data参数
      await indexedDB.saveData('searchHistory', limitedHistory);
      setSearchHistory(limitedHistory);
      console.log('保存后的搜索历史:', limitedHistory);
    } catch (error) {
      console.error('保存搜索历史失败:', error);
    }
  }, [indexedDB]);

  // 加载搜索历史
  const loadSearchHistory = useCallback(async () => {
    try {
      console.log('加载搜索历史');
      const existingHistory = await indexedDB.getData('searchHistory');
      console.log('加载到的搜索历史:', existingHistory);
      // getData已经直接返回了data字段的值，不需要再访问.data
      const history = existingHistory || [];
      setSearchHistory(history);
    } catch (error) {
      console.error('加载搜索历史失败:', error);
      setSearchHistory([]);
    }
  }, [indexedDB]);

  // 组件挂载时加载搜索历史
  useEffect(() => {
    // 先保存原始的localStorage方法
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;
    // 初始加载函数
    const initToken = async () => {
      try {
        // 安全地获取token，避免Clerk相关错误
        let token = null;
        try {
          token = await getToken() ?? '';
          originalSetItem('token', token);
          console.log('Clerk token获取结果:', token);
        } catch (clerkError) {
          console.warn('Clerk token获取失败，使用localStorage token:', clerkError);
          token = null;
        }
        
        const cNToken = localStorage.getItem('token');
        console.log('Token状态检查:', {
          clerkToken: token ? '有Clerk token' : '无Clerk token',
          localStorageToken: cNToken ? '有localStorage token' : '无localStorage token',
          localStorageToken值: cNToken
        });
        
        if(token || cNToken){
          console.log('有token，调用getSearchWordsByUser');
          try {
            const res = await getSearchWordsByUser();
            console.log('getSearchWordsByUser响应:', {
              响应类型: typeof res,
              是否为数组: Array.isArray(res),
              响应内容: res
            });
            if(res && Array.isArray(res)){
              console.log('成功获取用户搜索历史，数量:', res.length);
              if(res.length > 0){
                let responseData:any = []
                res.forEach((item: any) => {
                  if(item.keyword && item.keyword.trim() !== ''){
                    responseData.push(item.keyword);
                  }
                })
                setSearchHistory(responseData);
              }else{
                setSearchHistory([]);
              }
            } else {
              console.warn('getSearchWordsByUser返回空或非数组数据，使用空数组');
              setSearchHistory([]);
            }
          } catch (apiError) {
            console.error('getSearchWordsByUser API调用失败:', apiError);
            console.log('API调用失败，回退到本地搜索历史');
            loadSearchHistory();
          }
        } else {
          console.log('无token，加载本地搜索历史');
          loadSearchHistory();
        }
      } catch (error) {
        console.error('initToken函数执行出错:', error);
        console.log('出错时回退到本地搜索历史');
        loadSearchHistory();
      }
    }

    // 立即执行初始加载
    initToken();
    // 重写setItem方法
    localStorage.setItem = function(key: string, value: string) {
      originalSetItem.apply(this, [key, value]);
      if (key === 'token') {
        console.log('localStorage token被设置:', value);
        initToken();
      }
    };

    // 重写removeItem方法
    localStorage.removeItem = function(key: string) {
      originalRemoveItem.apply(this, [key]);
      if (key === 'token') {
        console.log('localStorage token被移除');
        initToken();
      }
    };

    // 保留跨标签页的监听
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        console.log('跨标签页 - localStorage token变化:', e.newValue);
        initToken();
      }
    }

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      // 恢复原始方法
      localStorage.setItem = originalSetItem;
      localStorage.removeItem = originalRemoveItem;
      window.removeEventListener('storage', handleStorageChange);
    }
  }, [loadSearchHistory, getToken]);
  // 在组件中添加状态来存储失败的图片索引
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [isUserAccountMenuOpen, setUserAccountMenuOpen] = useState(false);
  const [isBankMenuOptionOpen, setBankMenuOptionOpen] = useState(false);
  const dummyInputRef = useRef<HTMLInputElement>(null);
  const [hotSearchWords, setHotSearchWords] = useState<HotSearchWord[]>([]);
  const [loadingHotWords, setLoadingHotWords] = useState(true);
  
  const openUserAccountMenu = useCallback(() => {
    setUserAccountMenuOpen(true);
  }, []);

  const closeUserAccountMenu = useCallback(() => {
    setUserAccountMenuOpen(false);
  }, []);


  const openBankMenuOption = useCallback(() => {
    setBankMenuOptionOpen(true);
  }, []);

  const closeBankMenuOption = useCallback(() => {
    setBankMenuOptionOpen(false);
  }, []);


  const onLogoRedHContainerClick = useCallback(() => {
    // 预加载首页
    router.prefetch("/");
    router.push("/");
  }, [router]);

  const onTriggerContainerClick = useCallback(() => {
    // Add your code here
  }, []);
  const [isFocused, setIsFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const blurTimer = useRef<NodeJS.Timeout | null>(null);
  // 添加搜索历史容器的ref
  const searchHistoryRef = useRef<HTMLDivElement>(null);
  // 点击外部区域时隐藏搜索历史
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 如果搜索历史容器存在且点击事件不在容器内，也不在搜索框内，则隐藏
      if (searchHistoryRef.current &&
          !searchHistoryRef.current.contains(event.target as Node) &&
          inputRef.current && inputRef.current.nativeElement &&
          !inputRef.current.nativeElement.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    // 添加点击事件监听器
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // 清除事件监听器
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  // 搜索框聚焦和失焦事件
  const handleFocus = useCallback(async () => {
    console.log('搜索框聚焦');
    setIsFocused(true);
     const checkToken = async () => {
        // 先检查 localStorage 中的 token
        const cNToken = localStorage.getItem('token');
        if (cNToken) {
            return true;
        }
        // 如果没有 localStorage token，再检查 Clerk token
        try {
            const token = await getToken();
            return !!token;
        } catch {
            return false;
        }
    };
    const hasToken = await checkToken();
    if (hasToken) {
      // 有token时，重新调用getSearchWordsByUser获取最新数据
      const refreshSearchHistory = async () => {
        try {
          const res = await getSearchWordsByUser();
          if (res && Array.isArray(res)) {
            console.log('聚焦时刷新用户搜索历史，数量:', res.length);
            if(res.length > 0){
              let responseData:any = []
              res.forEach((item: any) => {
                if(item.keyword && item.keyword.trim() !== ''){
                  responseData.push(item.keyword);
                }
              })
            setSearchHistory(responseData);
          }else{
            setSearchHistory([]);
          }
          } else {
            console.log('聚焦时无用户搜索历史，使用本地历史');
            loadSearchHistory();
          }
        } catch (error) {
          console.error('聚焦时获取用户搜索历史失败:', error);
          loadSearchHistory();
        }
      };
      refreshSearchHistory();
    } else {
      // 无token时，加载本地搜索历史
      console.log('无token，聚焦时加载本地搜索历史');
      loadSearchHistory();
    }
    // 聚焦时重新加载搜索历史，确保数据最新
  }, [loadSearchHistory, getToken]);

  const handleBlur = useCallback(() => {
    console.log('搜索框失焦');
  }, []);
  // 获取热门搜索词
  const fetchHotSearchWords = useCallback(async () => {
    console.time('测试时间')
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_API_URL + '/homepage/hot-search-words', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch hot search words');
      }
      
      const data = await response.json();
      console.log('热门搜索词数据:', data);
      setHotSearchWords(filterHomepageHotSearchWords(data));
    } catch (error) {
      console.error('获取热门搜索词失败:', error);
      // 使用默认数据 - 直接内联，避免函数依赖
      setHotSearchWords([]);
    } finally {
      
      setLoadingHotWords(false);
      console.timeEnd('测试时间')
    }
  }, []);

  // 点击搜索按钮
  const handleSearchClick = useCallback(() => {
    if (searchValue.trim() === '') return;
    saveSearchHistory(searchValue); // 保存搜索历史
    setIsFocused(false);
    const targetUrl = `/banks-statistics?search=${encodeURIComponent(searchValue)}`;
    router.push(targetUrl);
  }, [searchValue, saveSearchHistory]);

  const handleSearchHistoryClick = (keyword: string) => {
    const targetUrl = `/banks-statistics?search=${encodeURIComponent(keyword)}`;
    setIsFocused(false);
    router.push(targetUrl);
  };

  // 点击热门搜索
  const handleHotSearchClick = useCallback((hotSearchWord: HotSearchWord) => {
    const keyword = hotSearchWord.keyword;
    saveSearchHistory(keyword); // 保存搜索历史
    const targetUrl = `/banks-statistics?search=${encodeURIComponent(keyword)}`;
    router.prefetch(targetUrl);
    router.push(targetUrl);
  }, [router, saveSearchHistory]);

  const getIconByType = useCallback((iconType: string) => {
    switch (iconType) {
      case 'company':
        return '/images/defaultBank.svg';
      case 'news':
        return '/images/news-icon.svg';
      case 'report':
        return '/images/report-icon.svg';
      default:
        return '/images/defaultBank.svg';
    }
  }, []);

  // 搜索输入变化时，请求接口
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    
    // 清除之前的定时器
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    if (value.trim() === '') {
      setSearchResults([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }
    
    // 立即显示下拉菜单，给用户即时反馈
    setShowDropdown(true);
    
    // 增加防抖时间到500ms，让用户有更多时间连续输入
    debounceTimer.current = setTimeout(async () => {
      try {
        console.log('发送搜索请求:', value);
        const startTime = performance.now();
        
        // 设置搜索状态，但不阻止用户输入
        setIsSearching(true);
        console.log("能否获取到token1")
        const token = await getToken();
        console.log("能否获取到token2")
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_API_URL + `/homepage/search?keyword=${encodeURIComponent(value)}&type=company`, {
          headers
        });
        console.log('搜索响应状态:', res.status);
        
        if (!res.ok) {
          console.error('搜索请求失败，状态码:', res.status);
          setSearchResults([]);
          return;
        }
        
        const data = await res.json();
        const endTime = performance.now();
        console.log('搜索响应数据:', data, `耗时: ${endTime - startTime}ms`);
        
        // 处理搜索结果，提取银行名称和地区信息
        const companies = (data.companies || []).map((item: any) => {
          console.log('处理公司数据:', item);
          return {
            id: item.id,
            companySortId: item.companySortId,
            name: item.name,
            locationSortId: item.locationName || item.locationSortId,
            logoLink: item.logoLink
          };
        });
        
        setSearchResults(companies);
        // 保持下拉菜单显示状态
        setShowDropdown(true);
      } catch (err) {
        console.error('搜索请求失败:', err);
        setSearchResults([]);
        // 保持下拉菜单显示状态
        setShowDropdown(true);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 增加到500ms
  }, [getToken]);
  
  const handleSelect = useCallback((company: any) => {
    setSearchValue(company.name);
    setShowDropdown(false);
    
    // 优先使用 companySortId，如果没有则使用 company.id
    const sortId = company.companySortId || company.id;
    const targetUrl = `/bank-info/${sortId}/overview${company.id ? `?companyId=${company.id}` : ''}`;
    
    // 预加载目标页面
    router.prefetch(targetUrl);
    
    // 延迟跳转，给预加载一些时间
    setTimeout(() => {
      router.push(targetUrl);
    }, 50);
  }, [router]);

  // 处理回车键搜索
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchValue.trim() === '') return;
      
      // 如果有搜索结果，显示所有结果
      if (searchResults.length > 0) {
        setShowDropdown(true);
      } else {
        // 如果没有搜索结果，尝试直接搜索
        console.log('搜索关键词:', searchValue);
        alert(`未找到与"${searchValue}"相关的银行`);
      }
    }
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (blurTimer.current) {
        clearTimeout(blurTimer.current);
      }
    };
  }, []);

  // 获取热门搜索词
  // useEffect(() => {
  //   fetchHotSearchWords();
  // }, [fetchHotSearchWords]);
  useEffect(()=>{
    const fetchData = async () => {
      console.time('测试时间')
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_API_URL + '/homepage/hot-search-words', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch hot search words');
        }
        const data = await response.json();
        console.log('热门搜索词数据:', data);
        setHotSearchWords(filterHomepageHotSearchWords(data));
      } catch (error) {
        console.error('获取热门搜索词失败:', error);
        // 使用默认数据 - 直接内联，避免函数依赖
        setHotSearchWords([]);
      } finally {
        setLoadingHotWords(false);
        console.timeEnd('测试时间')
      }
    };
    fetchData();
  }, [])

  // 监控编译性能
  useEffect(() => {
    CompilationMonitor.recordPageAccess('Homepage');
    return () => {
      CompilationMonitor.logCompilationStats();
    };
  }, []);

  // 处理图片加载失败
  const handleImageError = useCallback((index: number) => {
    setFailedImages(prev => new Set(prev).add(index));
  }, []);
  return (<>
    {/* 新的搜索展示页面 */}
    <div className={styles.searchContainer}>
      {/* 视频背景 */}
      <div className={styles.videoBackground}>
        <div className={styles.searchContent}>
          <div className={styles.searchContentTitle}>Neobank-er’s</div>
          <div className={styles.searchContentSubTitle}>{t('subtitle')}</div>
          <div className={styles.searchContentSearch}>
            <div className={`${styles.searchContentSearchItem} ${isFocused ? styles.searchContentSearchItemFocused : ''}`}>
              <Image src="/images/homepage/searchIcon.svg" alt="" width={31} height={31} />
              <Input ref={inputRef} onPressEnter={handleSearchClick} onFocus={() => handleFocus()} onBlur={handleBlur} maxLength={30} className={styles.searchContentInput} value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder={t('searchPlaceholder')} />
              {
                isFocused && searchHistory.length > 0 && (
                  <div ref={searchHistoryRef} className={styles.searchContentLocateList}>
                    <div className={styles.searchContentItemList}>
                      {searchHistory.map((keyword, index) => (
                        <div key={index} onClick={() => handleSearchHistoryClick(keyword)} className={styles.searchContentHistoryItem}>
                          {keyword}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }
            </div>
            <div onClick={handleSearchClick} className={styles.searchContentSearchButton}>{t('search')}</div>
          </div>
          <div className={styles.searchContentHotWord}>
            {
              hotSearchWords.map((item, index) => (
                <div onClick={() => handleHotSearchClick(item)} key={index} className={styles.searchContentHotWordItem}>
                  <Image src={failedImages.has(index) ? getIconByType(item.iconType) : item.logoUrl} alt={item.displayName || item.keyword} width={16} height={16} onError={() => handleImageError(index)} />
                  <div className={styles.searchContentHotWordItemText}>{item.displayName || item.keyword}</div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
    {/* 新的新闻组件 */}
    <NewsComponent></NewsComponent>
    <PopularBanks></PopularBanks>
    <Partner partner={t('partner')} />
    {isUserAccountMenuOpen && (
        <PortalPopup
            overlayColor="rgba(113, 113, 113, 0.3)"
            placement="Centered"
            onOutsideClick={closeUserAccountMenu}
        >
          <UserAccountMenu />
        </PortalPopup>
    )}
    {isBankMenuOptionOpen && (
        <PortalPopup
            overlayColor="rgba(113, 113, 113, 0.3)"
            placement="Centered"
            onOutsideClick={closeBankMenuOption}
        >
          <BankMenuOption
            companies={[]}
            show={false}
            onSelect={() => {}}
            inputRef={dummyInputRef}
          />
        </PortalPopup>
    )}
  </>);
};

export default Page;
