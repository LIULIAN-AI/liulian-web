'use client';
import { useState, useEffect, memo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
// 导航栏组件Props接口
import styles from './tab.module.css';
import Image from "next/image";
import { useClerk } from '@clerk/nextjs';
// 引入BankContext，用于获取当前银行信息【是否有用待确认】
import { useBankContext } from "@/contexts/BankContext";
// 引入优化导航工具
import { useOptimizedNavigation } from "@/utils/navigation";
import { Rate, Modal, message, Popover } from 'antd'
import { getPreferenceUserIdBanksUpdate } from '@/app/api/login/index'
import { useTranslations } from 'next-intl';
import { getMarketingId, getMarketingOverview } from "@/app/api/homepage/marketing"
interface TabProps {
  sortId: string;
  companyId: string;
}
interface BankHeaderInfo {
  logoLink: string;
  location: string;
  companyName: string;
  status: string;
  tag: Array<string>;
  following?: boolean;
}
const navItems = [
  { label: 'overview', path: '/overview' },
  { label: 'products', path: '/products' },
  { label: 'marketing', path: '/marketing' },
  { label: 'finances', path: '/financials' },
  { label: 'staff', path: '/staff' },
  // { label: 'Tech', path: '/tech' },
  // { label: 'Web3.0', path: '/web3' },
];
// 头部组件
const Header = memo(({headerInfo, loadHeaderInfo,updateFollowingStatus,clearHeaderCache, sortId}: {headerInfo: BankHeaderInfo, loadHeaderInfo: (sortId: string) => void, updateFollowingStatus: (isFollowing: boolean) => void, clearHeaderCache: (sortId: string) => void, sortId: string}) => {
  const router = useRouter();
  const t = useTranslations('BankInfo');
  const { user } = useClerk();
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  const [rateValue, setRateValue] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [failedImages, setFailedImages] = useState<boolean>(false);
  const [marketingOverview, setMarketingOverview] = useState<any>({
    companyStrategy: '',
  })
   // 处理图片加载失败
  const handleImageError = useCallback(() => {
    setFailedImages(true);
  }, []);

  // 点击返回按钮
  const handleBackClick = useCallback(() => {
    router.push('/');
  }, [router]);
  const showModal = () => {
    setIsModalOpen(true);
  };
  useEffect(() => {
    const initMarketingId = async () => {
      try {
        const marketingId = await getMarketingId(sortId.toString())
        console.log("获取到的marketingId数据", marketingId.toString())
        if(marketingId){
          const marketingOverview = await getMarketingOverview(marketingId)
          console.log("获取到的marketingOverview数据", marketingOverview.toString())
          setMarketingOverview(marketingOverview)
        }
      } catch (error) {
        message.error('获取信息失败，请重试');
      }
    };
    initMarketingId();
  }, [sortId]);
  const handleOk = () => {
    let userId: string | null = user?.id || null;
    if (isClient && !userId) {
      userId = localStorage.getItem('userId');
    }
    // 确保userId存在性检查
    if (!userId) {
      console.error("用户ID不存在");
      return;
    }
    let followedIng = [
    {
      "name": headerInfo?.companyName || '',
      "region": headerInfo?.location || '',
      "isFollowing": !headerInfo?.following
    }]
    let params = {
      userId: userId,
      followedBanks: followedIng,
      enablePersonalizedAIBank: true,
    }
    getPreferenceUserIdBanksUpdate(params).then(async res => {
      const newFollowingStatus = !headerInfo?.following;
      // 立即更新本地状态，实现无缝体验
      clearHeaderCache(sortId);
      updateFollowingStatus(newFollowingStatus);
      await loadHeaderInfo(sortId)
      setIsModalOpen(false);
    })
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
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
  return (
    <>
      <div className={styles.headerTab}>
        <div className={styles.headerTabLeft}>
          <div className={styles.headerTabLeftBreadcrumb} onClick={ handleBackClick }>
            {/* 这快应该是面包屑，但是UI是这个 */}
            <Image src="/images/bank-info/backIcon.svg" alt="" width={16} height={16} />
            <div className={styles.headerTabLeftBreadcrumbText}>{t('back')}</div>
          </div>
          <div className={styles.headerTabLeftBankName}>
            <div className={styles.headerTabLeftBankNameText}>{headerInfo?.companyName || t('loading')}</div>
            <div className={`${styles.headerTabLeftBankNamePoint} ${headerInfo?.status === "Live" ? '' : styles.headerTabLeftBankNamePointRed}`}></div>
            <div className={`${styles.headerTabLeftBankNameLive} ${headerInfo?.status === 'Live' ? '' : styles.headerTabLeftBankNameLiveRed}`}>{headerInfo?.status || t('loading')}</div>
            {(() => {
              const userId = user?.id || (isClient ? localStorage.getItem('userId') : null);
              return !!userId && (
                <div className={styles.headerTabLeftBankNameRate}>
                  <Rate onChange={(value) => {setRateValue(value); showModal()}} count={1} value={headerInfo?.following ? 1 : 0} />
                </div>
              );
            })()}
          </div>
          <div className={styles.headerTabLeftBankNameLocation}>
            <div className={styles.headerTabLeftBankNameLocationText}>{headerInfo?.location || t('loading')}</div>
            <Popover
              placement="bottom"
              content={
                <div style={{ 
                  maxWidth: '70vw',
                  width: 'auto',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-line',
                  wordBreak: 'break-word',
                  padding: '8px 0'
                }}>
                  {marketingOverview?.companyStrategy || ''}
                </div>
              }
              trigger="hover"
            >
              <div className={styles.headerTabLeftBankNameLocationInitText}>{marketingOverview?.companyStrategy || ''}</div>
            </Popover>
            <div className={styles.headerTabLeftBankTag}>
              {
                headerInfo?.tag && headerInfo.tag.length > 0 && headerInfo.tag.map((badge, index) => (
                  <div key={'badge_' +index} className={styles.headerTabLeftBankTagBadge}>
                    {/* <div className={styles.headerTabLeftBankTagPoint} /> */}
                    <div className={styles.headerTabLeftBankTagText}>{badge ? '#' + badge : ''}</div>
                  </div>
                ))
                }
            </div>
          </div>
        </div>
        <div className={styles.headerTabRight}>
          <Image style={{borderRadius: '50%'}} src={failedImages ? getIconByType('company') : headerInfo?.logoLink} alt='icon图标' width={80} height={80} onError={() => handleImageError()} />
        </div>
      </div>
      {/* 展示关注与取消关注的弹窗 */}
      <Modal title={t('prompt')} open={isModalOpen} okText={t('sure')} cancelText={t('cancel')} onOk={handleOk} onCancel={handleCancel}>
        <p>{!headerInfo?.following ? t('follow') : t('unfollow')} {headerInfo?.companyName || ''} 吗？</p>
      </Modal>
    </>
  )
})
// 导航栏组件
const NavBar = memo(({ currentPath, setCurrentPath, sortId, companyId }: { currentPath: string, setCurrentPath: React.Dispatch<React.SetStateAction<string>>, sortId: String, companyId: string }) => {
  const pathname = usePathname();
  const t = useTranslations('BankInfo');
  const router = useRouter();
  const { navigate } = useOptimizedNavigation();
  const handleTabClick = useCallback((path:any) => {
    setCurrentPath(path);
    const fullPath = companyId ? `/bank-info/${sortId}${path}?companyId=${companyId}` : `/bank-info/${sortId}${path}`;
    // 使用优化的导航函数，包含预加载
    navigate(fullPath, {
      prefetch: true,
      delay: 30, // 减少延迟时间
      replace: false
    });
  }, [sortId, setCurrentPath, navigate])
  // 监听路径变化，当页面加载完成后清除加载状态
  useEffect(() => {
    if (currentPath && pathname.endsWith(currentPath)) {
        // 页面已经加载完成，清除加载状
        // 直接清除加载状态，不再使用超时机制
        setCurrentPath('');
    }
  }, [pathname, currentPath, setCurrentPath]);
  // 预加载所有相关页面
  useEffect(() => {
    navItems.forEach(item => {
      const fullPath = companyId ? `/bank-info/${sortId}${item.path}?companyId=${companyId}` : `/bank-info/${sortId}${item.path}`;
      router.prefetch(fullPath);
    });
  }, [sortId, router, companyId]);
  return (
    <div className={styles.navItemsList}>
      {
        navItems.map((item) => {
          const isActive = pathname.endsWith(item.path);
          const isTargetPath = currentPath === item.path;
          return (
            <div className={`${isActive ? styles.navItemActive : styles.navItemCommon} ${isTargetPath ? styles.navItemSelected : ''}`} onClick={() => handleTabClick(item.path)} key={item.path}>
              <div className={styles.navItemText}>
                { t(item.label) }
              </div>
            </div>
          )
        })
      }
    </div>
  )
})
const NavigationBar = memo(function NavigationBar({ sortId, companyId }: TabProps) {
    // 使用共享的银行上下文
    const pathname = usePathname();
    const t = useTranslations('BankInfo');
    const { headerInfo, loading,clearHeaderCache,updateFollowingStatus, loadHeaderInfo, clearCache  } = useBankContext();
    const [currentPath, setCurrentPath] = useState('');
    const [prevSortId, setPrevSortId] = useState<string | null>(null);
    const currentNavItem = navItems.find((item) => item.path === currentPath);
    const currentTabLabel = currentNavItem ? t(currentNavItem.label) : t('load');
    console.log("获取到的sortId:", sortId);
    // 定义默认的header信息
    const defaultHeaderInfo: BankHeaderInfo = {
        logoLink: '/images/defaultBank.svg',
        location: 'Default Location',
        companyName: 'Default Company Name',
        status: 'Default Status',
        tag: ['Banking', 'Banking', 'Banking']
    };
    // 只在 sortId 变化时加载数据
    useEffect(() => {
      if (sortId && sortId !== prevSortId) {
        clearCache();
        loadHeaderInfo(sortId);
        setPrevSortId(sortId);
      } else if (sortId && sortId === prevSortId) {
        console.log("已经加载过数据，跳过重新加载");
      } else {
        console.log("sortId为空，不执行加载");
      }
    }, [sortId, loadHeaderInfo, clearCache, prevSortId]);
    // 合并headerInfo和默认值，确保始终有值传递给Header
    const headerData = headerInfo || defaultHeaderInfo;
    return (
      <>
        <Header clearHeaderCache={clearHeaderCache} updateFollowingStatus={updateFollowingStatus} headerInfo={headerData} sortId={sortId} loadHeaderInfo={loadHeaderInfo} />
        <NavBar sortId={sortId} companyId={companyId} currentPath={currentPath} setCurrentPath={setCurrentPath} />
        <div className={styles.tabLine}></div>
        {/* 显示加载状态 */}
        {
          currentPath && (
          <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <div className={styles.loadingText}>{t('loadingPage', { tab: currentTabLabel })}</div>
          </div>
        )}
      </>
    )
})

export default NavigationBar;