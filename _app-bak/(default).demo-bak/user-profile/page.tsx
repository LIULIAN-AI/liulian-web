'use client'
import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation';
import styles from "app/css/useProfile.module.css";
import SubPage from '@/components/profile/SubPage';
import PreferencePage from '@/components/profile/PreferencePage';
import InvitePage from '@/components/profile/InvitePage';

import { useTranslations } from 'next-intl';

const Profile = () => {
  const t = useTranslations('Navigation');
  const searchParams = useSearchParams();
  const page = searchParams.get('page');
  useEffect(() => {
    if (page) {
      setActiveNavBar(page === 'subPage' ? 'SubPage' : page === 'preference' ? 'Preference' : 'Invite')
      scrollToRef(page === 'subPage' ? section1Ref : page === 'preference' ? section2Ref : section3Ref);
    }
  }, [page]);
  // 创建 refs
  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const section3Ref = useRef(null);

  // 滚动到指定位置的函数
  const scrollToRef = (ref:any) => {
    ref.current?.scrollIntoView({
      behavior: 'smooth', // 平滑滚动
      block: 'start',     // 顶部对齐
    });
  };
  const [activeNavBar, setActiveNavBar] = useState('SubPage');
  const navBarList = [
    {
      name: 'SubPage',
      value: 'subPage'
    },
    {
      name: 'Preference',
      value: 'preference'
    },
    {
      name: 'Invite',
      value: 'invite'
    },
  ]
  return (
    <div className={styles.profile}>
      <div className={styles.profileTitle}>
        <div className={styles.profileTitleText}>{t('profile')}</div>
      </div>
      <div className={styles.profileContent}>
      <div className={styles.profileNavbar}>
        {
          navBarList.map((item) => (
            <div
              key={item.name}
              className={activeNavBar === item.name ? styles.profileNavbarItemActive : styles.profileNavbarItem}
              onClick={() => {setActiveNavBar(item.name); scrollToRef(item.name === 'SubPage' ? section1Ref : item.name === 'Preference' ? section2Ref : section3Ref)}}
            >
              {t(item.value)}
            </div>
          ))
        }
      </div>
      <div className={styles.profilePage}>
        <div style={{marginBottom: '40px'}} ref={section1Ref}>
          <SubPage />
        </div>
        <div style={{marginBottom: '40px'}} ref={section2Ref}>
          <PreferencePage />
        </div>
        <div style={{marginBottom: '40px'}} ref={section3Ref}>
          <InvitePage />
        </div>
      </div>
    </div>
    </div>
  )
}
export default Profile;