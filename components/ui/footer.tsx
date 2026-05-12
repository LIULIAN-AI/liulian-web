import { useRouter } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image'
import Link from 'next/link';
import styles from '../../app/css/footer.module.css';
import { getNewsLink } from '@/app/api/homepage';
import { useBankContext } from '@/contexts/BankContext';
import { useTranslations } from 'next-intl';
import { message } from 'antd';
export default function Footer() {
  const t = useTranslations('Navigation');
  const router = useRouter();
  const [resourceType, setResourceType] = useState('1')
  const [newsLink, setNewsLink] = useState([])
  const { setNavBarColor } = useBankContext();
  const handleNavigation = useCallback((path: string) => {
    switch(path){
      case '/banks-statistics':
        setNavBarColor(0);
        break;
      case '/news&report':
        setNavBarColor(1);
        break;
      default:
        setNavBarColor(-1);
        break;
    }
    if(path === '/user-profile'){
      if(!localStorage.getItem('userId')){
        message.error("请登录后再操作");
        return;
      }
    }
    router.push(path);
  }, [router]);
  // 跳转到aboutUs页面
  const handleAboutUs = useCallback(() => {
    setNavBarColor(2);
    router.push('/about-us');
  }, [router, setNavBarColor]);
  useEffect(() => {
    getNewsLink(resourceType).then((res:any) => {
      if(res){
        setNewsLink(res)
      }else{
        setNewsLink([])
      }
    })
  }, [resourceType])
  const callbackIcon = (iconUrl: string) => {
    return iconUrl
  }
  // 展示图标信息及相应的跳转
  const mediaLink = [
    {
      icon: '/images/footer/LinkedIn.svg',
      link: 'https://www.linkedin.com/',
      alt: 'LinkedIn',
    },
    {
      icon: '/images/footer/Instagram.svg',
      link: 'https://www.instagram.com/',
      alt: 'Instagram',
    },
    {
      icon: '/images/footer/xiaohongshu.svg',
      link: 'https://www.xiaohongshu.com/explore',
      alt: '小红书',
    },
    {
      icon: '/images/footer/weChat.svg',
      link: 'https://weixin.qq.com/',
      alt: '微信',
    },
  ]
  // 中间的左边的跳转页面
  const newBottomLeftMiddleLeftLinks = [
    {
      link: '/',
      alt: 'home',
    },
    {
      link: '/banks-statistics',
      alt: 'banksStatistics',
    },
    // {
    //   link: '/compliance',
    //   alt: 'Compliance',
    // },
    {
      link: '/news&report',
      alt: 'news',
    },
    {
      link: '/user-profile',
      alt: 'profile',
    },
  ]
  // 中间的右边的跳转页面
  const newBottomLeftMiddleRightLinks = [
    {
      link: '/',
      alt: 'aboutNeobanker',
    },
    {
      link: '/',
      alt: 'reportDebug',
    },
    {
      link: '/',
      alt: 'support',
    },
  ]
  // 关于我们的中间展示数据
  const newBottomRightMiddleLinks = [
    {
      url: '',
      name: 'neobanks',
    },
    {
      url: '',
      name: 'dataDriven',
    },
    {
      url: '/images/footer/Sparkle.svg',
      name: 'innovation',
    },
  ]
  return (<div className={styles.newBottom}>
    <div className={styles.newBottomLeft}>
      <div className={styles.newBottomLeftTop}>
        <div className={styles.newBottomLeftTopIconText}>
          <Image className={styles.newBottomLeftTopIconTextIcon} src="/images/footer/neobankerRed.svg" alt="eoBanker" width={32} height={32} />
          <span className={styles.newBottomLeftTopIconTextText}>eoBanker</span>
        </div>
        <div className={styles.newBottomLeftTopLinks}>
          {
            newsLink.map((item:any, index) => (
              <Link className={styles.newLinks} rel="noopener noreferrer" key={index || item.resourceName} href={item.sourceUrl} target="_blank" aria-label={`访问${item.resourceName}页面`}>
                <Image src={callbackIcon(item.iconUrl)} alt={item.resourceName} width={32} height={32} />
              </Link>
            ))
          }
        </div>
      </div>
      <div className={styles.newBottomLeftMiddle}>
        <div className={styles.newBottomLeftMiddleLeft}>
          {
            newBottomLeftMiddleLeftLinks.map((item, index) => (
              // <Link className={index === 0 ? styles.newBottomLeftMiddleLinkActive : styles.newBottomLeftMiddleLink} rel="noopener noreferrer" key={index || item.alt} href={item.link} aria-label={`访问${item.alt}页面`}>
              //   {item.alt}
              // </Link>
              <div className={index === 0 ? styles.newBottomLeftMiddleLinkActive : styles.newBottomLeftMiddleLink} rel="noopener noreferrer" key={index || item.alt} onClick={() => handleNavigation(item.link)} aria-label={`访问${item.alt}页面`}>{t(item.alt)}</div>
            ))
          }
        </div>
        <div className={styles.newBottomLeftMiddleRight}>
          {
            newBottomLeftMiddleRightLinks.map((item, index) => (
              <Link className={index === 0 ? styles.newBottomLeftMiddleLinkActive : styles.newBottomLeftMiddleLink} rel="noopener noreferrer" key={index || item.alt} href={item.link} aria-label={`访问${item.alt}页面`}>
                {t(item.alt)}
              </Link>
            ))
          }
        </div>
      </div>
      <div className={styles.newBottomLeftBottom}>
        {t('copyright')}
      </div>
    </div>
    <div onClick={handleAboutUs} className={styles.newBottomRight}>
      <div className={styles.newBottomRightTop}>
        <Image className={styles.newBottomRightTopImage} src="/images/footer/neobankerWhite.svg" alt="neoBankerWhite" width={89.2} height={88.765} />
        <div className={styles.newBottomRightTopAboutUs}>{t('about')}</div>
      </div>
      <div className={styles.newBottomRightMiddle}>
        {
          newBottomRightMiddleLinks.map((item, index) => (
              <div className={styles.newBottomRightMiddleItem} key={index || item.name}>
                {item.url && <Image className={styles.newBottomRightMiddleIcon} src={item.url} alt={item.name} width={10.492} height={10.489} />}
                <div className={styles.newBottomRightMiddleItemText}>{t(item.name)}</div>
              </div>
          ))
        }
      </div>
      <div className={styles.newBottomRightBottom}>{t('aboutNeobankerDescription')}</div>
    </div>
  </div>)
}
