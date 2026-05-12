'use client';
import { useRouter, usePathname, useParams } from "next/navigation";
import styles from '@/app/(default)/bank-info/[sortId]/overview/overview.module.css';
import { useEffect, useState, useCallback, useRef } from "react";
import { CompanyHeader } from  "@/app/model/company/company";
import { getHeader } from "@/app/api/company/company";
import { Tag } from "antd";
import { useOptimizedNavigation, useSmartPrefetch } from "@/utils/navigation";

const navItems = [
    { label: 'Overview', path: '/overview' },
    { label: 'Products', path: '/products' },
    { label: 'Marketing', path: '/marketing' },
    { label: 'Financials', path: '/financials' },
    { label: 'Staff', path: '/staff' },
    { label: 'Tech', path: '/tech' },
    { label: 'Web3.0', path: '/web3' },
];
const defaultHeader = { companyName: '', location: '', tag: ['s', 'f', 'banking'], logoLink: '', status: ''};

export default function NavigationBar({ children }: { children?: React.ReactNode }) {
    const [headerInfo, setHeaderInfo] = useState<CompanyHeader>(defaultHeader);
    const [loading, setLoading] = useState(true);
    const [currentPath, setCurrentPath] = useState('');
    
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const sortId = params.sortId;
    
    // 使用优化的导航Hook
    const { navigate, prefetch } = useOptimizedNavigation();
    const { prefetchRelated } = useSmartPrefetch();

    useEffect(() => {
        const loadHeaderInfo = async () => {
            try {
                setLoading(true);
                const data = await getHeader({ companySortId: sortId.toString() });
                setHeaderInfo(data);
                
                // 智能预加载相关页面
                prefetchRelated(pathname);
            } catch (error) {
                console.error('Failed to load header info:', error);
                // 保持默认值
            } finally {
                setLoading(false);
            }
        };

        if (sortId) {
            loadHeaderInfo();
        }
    }, [sortId, pathname, prefetchRelated]);

    // 处理Back按钮点击事件
    const handleBackClick = useCallback(() => {
        navigate('/', { prefetch: true });
    }, [navigate]);

    // 处理tab导航点击事件 - 使用优化的导航
    const handleTabClick = useCallback((targetPath: string) => {
        const fullPath = `/bank-info/${sortId}${targetPath}`;
        
        // 如果点击的是当前页面，不做任何操作
        if (pathname === fullPath) return;
        
        console.log('切换到页面:', targetPath, '时间:', new Date().toISOString());
        setCurrentPath(targetPath);
        
        // 使用优化的导航函数
        navigate(fullPath, { prefetch: true, delay: 30 });
    }, [navigate, sortId, pathname]);

    // ZAbank头部内容
    const header = (
        <div className={styles.bankSectionHeader}>
            <div className={styles.exampleDashboardCard}>
                <div className={styles.container6}>
                    <div className={styles.container7}>
                        <div className={styles.button} onClick={handleBackClick}>
                            <img className={styles.arrowLeftminiIcon} alt="" src="/images/tech/arrow-leftMini.svg" />
                            <div className={styles.label}>Back</div>
                        </div>
                    </div>
                    <div className={styles.container8}>
                        <div className={styles.container9}>
                            <div className={styles.zaBank}>{headerInfo.companyName}</div>
                            <div className={`${styles.background} ${headerInfo.status === "Live" ? '' : styles.redStyle}`}  />
                            <div className={`${styles.live} ${headerInfo.status === 'Live' ? '' : styles.redFont}`}>{headerInfo.status}</div>
                        </div>
                        <div className={styles.container10}>
                            <div className={styles.container7}>
                                <div className={styles.badgeList}>
                                    <div className={styles.badges}>
                                        {headerInfo.tag && headerInfo.tag.length > 0 && headerInfo.tag.map((badge, index) => (
                                            <div key={index} className={styles.badge}>
                                                <div className={styles.badgeChild} />
                                                <div className={styles.badge1}>{badge}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className={styles.leaprateForexTrading}>Leaprate Forex Trading News</div>
                                </div>
                            </div>
                            <div className={styles.hongKong}>{headerInfo.location}</div>
                        </div>
                    </div>
                </div>
                <img
                    className={styles.pxZaBankLogosvgpngIcon}
                    alt=""
                    src={headerInfo.logoLink || "/images/defaultBank.svg"}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/defaultBank.svg";
                    }}
                />
            </div>
            
        </div>
    );

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            {header}
            <div className={styles.container11}>
                {navItems.map((item) => {
                    const isActive = pathname.includes(item.path);
                    const isTargetPath = currentPath === item.path;
                    
                    return (
                        <button
                            key={item.path}
                            className={`
                                ${isActive ? styles.button2 : styles.button4}
                                ${isTargetPath ? styles.buttonNavigating : ''}
                            `}
                            onClick={() => handleTabClick(item.path)}
                        >
                            <div className={styles.label}>
                                {isTargetPath ? 'Loading...' : item.label}
                            </div>
                        </button>
                    );
                })}
            </div>
            <div className={styles.line} />
            
            {/* 显示加载状态或子页面内容 */}
            {currentPath && (
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <div className={styles.loadingText}>正在加载 {navItems.find(item => item.path === currentPath)?.label} 页面...</div>
                </div>
            )}
            {children}
        </>
    );
}