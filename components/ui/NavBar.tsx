'use client'
import { useState, useCallback, Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from 'next/navigation';
import Image from "next/image";
import styles from "../../app/css/NavBar.module.css";
import { Input, Popover } from 'antd';
import type { PopoverProps } from 'antd';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import "/app/css/Clerk.css";
import SubPage from '@/components/profile/SubPage';
import PreferencePage from '@/components/profile/PreferencePage';
import InvitePage from '@/components/profile/InvitePage';
import NotiPage from '@/components/profile/NotiPage';
import SettingPage from '@/components/profile/SettingPage';
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslations } from 'next-intl';
import { onLogout } from '@/app/api/login';
import IndexedDBUtil from "@/utils/indexedDb";
import { useBankContext } from '@/contexts/BankContext';
// 新的接口
import { postAccountLogout } from '@/app/api/login'
import { getBanksStatistics } from '@/app/api/homepage/banks-statistics'
// 导入区域判断工具函数
import { useIsMainland } from '@/components/utils/region-utils'
export default function NavBar() {
  const t = useTranslations('Navigation');
  const router = useRouter();
  const pathname = usePathname();
  const isMainland = useIsMainland();
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 添加登录状态管理
  const [searchValue, setSearchValue] = useState('');
  const [openPopover, setOpenPopover] = useState(false);
  const { navBarColor, setNavBarColor } = useBankContext(); // 获取颜色状态
  // 检查登录状态的函数
  const checkLoginStatus = useCallback(() => {
    const isBrowser = typeof window !== 'undefined';
    const token = isBrowser ? localStorage.getItem('token') : null;
    setIsLoggedIn(!!token);
  }, []);
  // 监听认证状态变化事件
  useEffect(() => {
    const handleAuthStatusChanged = (event: CustomEvent) => {
      setIsLoggedIn(event.detail.isLoggedIn);
    };
    window.addEventListener('auth-status-changed', handleAuthStatusChanged as EventListener);
    return () => {
      window.removeEventListener('auth-status-changed', handleAuthStatusChanged as EventListener);
    };
  }, []);
  // 组件挂载时检查登录状态
  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);
  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };
  const navBarLeftItems = [
    {
      href: "/banks-statistics",
      label: "banksStatistics",
      icon: "/images/navbar/arrow.svg",
    },
    {
      href: "/news&report",
      label: "news",
      icon: ""
    },
    // {
    //   href: "/compliance",
    //   label: "Compliance",
    //   icon: "",
    // },
    {
      href: "/about-us",
      label: "about",
      icon: "",
    },
  ]
  const DotIcon = () => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
        <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z" />
      </svg>
    )
  }
  const myLink = useCallback((href: string, index: number) => {
    setActiveIndex(index);
    setNavBarColor(-1)
    router.push(href);
  }, [router, setActiveIndex, setNavBarColor]);
  useEffect(() => {
    setActiveIndex(navBarColor);
  }, [navBarColor]);
  // 退出登录
  const handleLogout = async () => {
    try {
      const isBrowser = typeof window !== 'undefined';
      // 先执行登出API调用
      await postAccountLogout();
      onLogout();
      // 清除本地存储的token
      if (isBrowser) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
      }
      // 更新登录状态
      setIsLoggedIn(false);
      // 跳转到首页
      router.push('/');
      router.refresh(); // 强制刷新页面状态
    } catch (error) {
      console.error('Logout failed:', error);
      // 即使API调用失败，也清除本地token并更新状态
      const isBrowser = typeof window !== 'undefined';
      if (isBrowser) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
      }
      setIsLoggedIn(false);
      router.push('/');
      router.refresh();
    }
  };
  // 跳转页面
  const handleProfilePage = (page: string) => {
    router.push(`/user-profile?page=${page}`);
  }
  const customLogin = () => {
    return (
      <>
        {!isLoggedIn  && <Link href="/login" prefetch>{t('signIn')}</Link>}
        {isLoggedIn  && (
          <div className={styles.loginContainer}>
            <Popover placement="bottom" content={getToolContent()} arrow={false}>
              <div className={styles.loginContainerImage}>
                <Image className={styles.loginContainerImageIcon}
                  src="/images/navbar/loginDefaultPhone.svg"
                  alt="loginDefaultPhone"
                  width={24}
                  height={24}
                />
              </div>
            </Popover>
          </div>
        )}
      </>
    )
  }
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
      console.log('保存后的搜索历史:', limitedHistory);
    } catch (error) {
      console.error('保存搜索历史失败:', error);
    }
  }, [indexedDB]);
  const handleSearchClick = useCallback(() => {
    if (searchValue.trim() === '') return;
    saveSearchHistory(searchValue); // 保存搜索历史
    setIsFocused(false);
    const targetUrl = `/banks-statistics?search=${encodeURIComponent(searchValue)}`;
    router.push(targetUrl);
    setSearchValue('');
  }, [searchValue, saveSearchHistory]);
  const getToolContent = () => {
    return (
      <div className={styles.loginContainerContent}>
        <div className={styles.loginContainerContentItem}
          onClick={()=> {handleProfilePage('subPage')}}
          style={{ cursor: 'pointer' }}
        >
          {t('subPage')}
        </div>
        <div className={styles.loginContainerContentItem}
          onClick={()=> {handleProfilePage('preference')}}
          style={{ cursor: 'pointer' }}
        >
          {t('preference')}
        </div>
        <div className={styles.loginContainerContentItem}
          onClick={()=> {handleProfilePage('invite')}}
          style={{ cursor: 'pointer' }}
        >
          {t('invite')}
        </div>
        <div className={styles.loginContainerContentItem}
          onClick={handleLogout}
          style={{ cursor: 'pointer' }}
        >
          {t('signOut')}
        </div>
      </div>
    )
  }
  const getContent = () => {
    const [bankName, setBankName] = useState<any>([]);
    const [paymentName, setPaymentName] = useState<any>([]);
    const [otherName, setOtherName] = useState<any>([]);
    useEffect(() => {
      const initBanksStatistics = async () => {
        try {
          let bankNameArr = [], paymentNameArr = [], otherNameArr = [];
          const response = await getBanksStatistics();
          if(response && response.length){
            for(let item of response){
              bankNameArr.push(item.name)
              if(item.productType === '1'){
                paymentNameArr.push(item.productName)
              }else{
                otherNameArr.push(item.productName)
              }
            }
            // 去重处理
          const uniqueBankNameArr = [...new Set(bankNameArr)];
          const uniquePaymentNameArr = [...new Set(paymentNameArr)];
          const uniqueOtherNameArr = [...new Set(otherNameArr)];

          setBankName(uniqueBankNameArr);
          setPaymentName(uniquePaymentNameArr);
          setOtherName(uniqueOtherNameArr)
          } else {
            setBankName([]);
            setPaymentName([]);
            setOtherName([]);
          }
        } catch (error) {
          setBankName([]);
          setPaymentName([]);
          setOtherName([]);
          console.error('Failed to fetch banks statistics:', error);
        }
      }
      initBanksStatistics();
    }, []);
    return (
      <div className={styles.NavigationBarPopoverContainer}>
        <div className={styles.NavigationBarPopover}>
          {/* <div className={styles.NavigationBarPopoverTitle}>Emerging banks</div> */}
          <div className={styles.NavigationBarPopoverTitle}>Banking</div>
          <div className={styles.NavigationBarPopoverItem}>
            {
              bankName.map((item:any, index:number) => {
                return (
                  <div className={styles.NavigationBarPopoverItemRight} key={'bank_' + index}>{index == bankName.length - 1 ? item : item + ' |'}</div>
                )
              })
            }
          </div>
          {/* <div className={styles.NavigationBarPopoverTitle}>Loan business</div> */}
          <div className={styles.NavigationBarPopoverTitle}>Fintech Payments & Spend Management</div>
          <div className={styles.NavigationBarPopoverItem}>
            {
              paymentName.map((item:any, index:number) => {
                return (
                  <div className={styles.NavigationBarPopoverItemRight} key={'payment_' + index}>{index == paymentName.length - 1 ? item : item + ' |'}</div>
                )
              })
            }
          </div>
          {/* <div className={styles.NavigationBarPopoverTitle}>Payment Management</div> */}
          <div className={styles.NavigationBarPopoverTitle}>Fintech Lending & Investing</div>
          <div className={styles.NavigationBarPopoverItem}>
            {
              otherName.map((item:any, index:number) => {
                return (
                  <div className={styles.NavigationBarPopoverItemRight} key={'other_' +index}>{index == otherName.length - 1 ? item : item + ' |'}</div>
                )
              })
            }
          </div>
        </div>
        <Image className={styles.NavigationBarPopoverImage} style={{cursor: 'pointer'}} src="/images/navbar/bankBackground.jpg" alt="User" width={137} height={137} />
      </div>
    )
  }
  return (
    <div className={styles.NavigationBar}>
      <div className={styles.NavigationBarLeft}>
        {/* <Link href="/homepage" prefetch> */}
        <Image style={{cursor: 'pointer'}} onClick={() => myLink("/homepage", -1)} src="/images/navbar/logo.svg" alt="NBanker Logo" width={110} height={40} />
        {/* </Link> */}
        <div className={styles.NavigationBarLeftItem}>
          { navBarLeftItems.map((item, index)=>{
            const isActive = pathname.endsWith(item.href);
            return (
              <div key={'item_' + index}>
                {
                  item && item.icon ? (
                    <Popover onOpenChange={(bool) => setOpenPopover(bool)} placement="bottom" content={getContent()} arrow={false}>
                      <div className={styles.NavigationBarLeftItemContainer} onClick={ () =>myLink(item.href, index) } key={'pop_' + index}>
                        <div className={styles.NavigationBarLeftItemLabel}>
                          <div className={`${styles.NavigationBarLeftItemLabelText} ${isActive ? styles.NavigationBarLeftItemLabelTextActive : ''}`}>{t(item.label)}</div>
                          { item && item.icon && <Image style={{transform: openPopover ? 'rotate(180deg)' : 'rotate(0deg)', marginTop: openPopover ? '2px' : '0px'}} src={item.icon} alt={item.label} width={16} height={16} />}
                        </div>
                      </div>
                    </Popover>
                  ) : (
                    <div className={styles.NavigationBarLeftItemContainer} onClick={ () =>myLink(item.href, index) } key={index}>
                      <div className={styles.NavigationBarLeftItemLabel}>
                        <div className={`${styles.NavigationBarLeftItemLabelText} ${isActive ? styles.NavigationBarLeftItemLabelTextActive : ''}`}>{t(item.label)}</div>
                        { item && item.icon && <Image src={item.icon} alt={item.label} width={16} height={16} />}
                      </div>
                    </div>
                  )
                }
              </div>
            )
          }) }
        </div>
      </div>
      <div className={styles.NavigationBarRight}>
        <Input onPressEnter={handleSearchClick} value={searchValue} onChange={(e) => setSearchValue(e.target.value)} className={`${styles.NavigationBarRightSearch} ${isFocused ? styles.NavigationBarRightSearchFocused : ''}`} maxLength={30} onFocus={handleFocus} onBlur={handleBlur}
          prefix={<Image src="/images/navbar/search.svg" alt="Search" width={16} height={16} />}
        />
        <div className={styles.NavigationBarRightLanguage}>
          <LanguageSwitcher />
        </div>
        <div className={styles.NavigationBarRightLogin}>
          <Suspense fallback={<div>Loading...</div>}>
            {
              isMainland ? customLogin() : (
                <div className={styles.buttons}>
                  <SignedOut>
                    <SignInButton fallbackRedirectUrl="/" />
                  </SignedOut>
                  <SignedIn>
                    <UserButton>
                        <UserButton.UserProfilePage
                          label="My Subscription"
                          url="subscription"
                          labelIcon={<DotIcon />}
                        >
                          <SubPage />
                        </UserButton.UserProfilePage>
                        <UserButton.UserProfilePage
                          label="Preference"
                          url="preference"
                          labelIcon={<DotIcon />}
                        >
                          <PreferencePage />
                        </UserButton.UserProfilePage>
                        <UserButton.UserProfilePage
                          label="Invite user"
                          url="invite"
                          labelIcon={<DotIcon />}
                        >
                          <InvitePage />
                        </UserButton.UserProfilePage>
                        {/* <UserButton.UserProfilePage
                          label="Notification"
                          url="notification"
                          labelIcon={<DotIcon />}
                        >
                          <NotiPage />
                        </UserButton.UserProfilePage>
                        <UserButton.UserProfilePage
                          label="Setting"
                          url="setting"
                          labelIcon={<DotIcon />}
                        >
                          <SettingPage />
                        </UserButton.UserProfilePage> */}

                    </UserButton>
                  </SignedIn>
              </div>
              )
            }
          </Suspense>
        </div>
      </div>
    </div>
  )
}