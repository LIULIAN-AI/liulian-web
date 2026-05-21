"use client";
import {
  FunctionComponent,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import UserAccountMenu from "@/components/UserAccountMenu";
import PortalPopup from "@/components/PortalPopup";
import styles from "@/app/css/AboutUs.module.css";
import type { FormProps } from "antd";
// Footer已由layout提供，无需重复导入
import Image from "next/image";
import { Form, Input, message, Tooltip, Image as AntdImage } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
// swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

// 关于我们接口
import { getContactUs, getOurTeam, getOurPartner } from "@/app/api/homepage";
import { config } from "@/config/environment";
import { resolveAssetUrl } from "@/utils/resolveAssetUrl";
import { useTranslations } from "next-intl";

type FieldType = {
  email?: string;
};
// 在文件顶部添加正则表达式
const emailRegex = /^[\w.-]+@([\w-]+\.)+[\w-]{2,}$/;
const EXCLUDED_TEAM_MEMBER_NAMES = new Set([
  "Arthur",
  "徐斌",
  "龚文武",
  "魏靖婷",
  "Dr. Donglian MA"
]);
const TEAM_MEMBER_NAME_OVERRIDES: Record<string, string> = {
  "聂志刚": "NIE Zhigang",
};
const TEAM_MEMBER_ROLE_OVERRIDES: Record<string, string> = {
  "Dr. Wenjie Xu": "Cheif X-anything Officer",
  "聂志刚": "Financial Controller",
};
const MANUAL_CORE_TEAM_MEMBERS = [
  {
    name: "Hezheng Meng",
    tag: "Data lead",
    title: "",
    url: "/images/aboutus/avatar/Hezheng Meng.png",
  },
  {
    name: "JINHE",
    tag: "Data Product Manager",
    title: "",
    url: "/images/aboutus/avatar/JINHE.png",
  },
  {
    name: "Andrew",
    tag: "Data Analyst",
    title: "",
    url: "/images/aboutus/avatar/Andrew.png",
  },
  {
    name: "Xiaochong Jiang",
    tag: "Chief Technology Officer",
    title: "",
    url: "/images/aboutus/avatar/Xiaochong Jiang.png",
  },
  {
    name: "Tasng Hing Ho, Donald",
    tag: "Fintech Frontend Engineer",
    title: "",
    url: "/images/aboutus/avatar/Tasng Hing Ho, Donald.png",
  },
  {
    name: "Kam Chun Yu",
    tag: "Fintech Frontend Engineer",
    title: "",
    url: "/images/aboutus/avatar/Kam Chun Yu.png",
  },
  {
    name: "Wong Chi Chung",
    tag: "Fintech Frontend Engineer",
    title: "",
    url: "/images/aboutus/avatar/Wong Chi Chung.png",
  },
];

// 邮箱验证函数
const validateEmailFormat = (email: string): boolean => {
  return emailRegex.test(email);
};

const shouldIncludeTeamMember = (name?: string | null): boolean => {
  if (!name) {
    return true;
  }

  return !EXCLUDED_TEAM_MEMBER_NAMES.has(name.trim());
};

const getTeamMemberName = (name?: string | null): string => {
  if (!name) {
    return "";
  }

  return TEAM_MEMBER_NAME_OVERRIDES[name.trim()] || name.trim();
};

const getTeamMemberRole = (name?: string | null, fallbackRole?: string | null): string => {
  if (!name) {
    return fallbackRole?.trim() || "";
  }

  return TEAM_MEMBER_ROLE_OVERRIDES[name.trim()] || fallbackRole?.trim() || "";
};

const appendManualCoreTeamMembers = (members: any[]) => {
  const existingNames = new Set(
    members
      .map((member) => (typeof member?.name === "string" ? member.name.trim() : ""))
      .filter(Boolean)
  );

  const manualMembersToAdd = MANUAL_CORE_TEAM_MEMBERS.filter(
    (member) => !existingNames.has(member.name)
  );

  return [...members, ...manualMembersToAdd];
};
// What we offer
const WhatWeOffer = ({ t }: { t: (key: string) => string }) => {
  const getLocaleFromCookie = () => {
    if (typeof window !== "undefined") {
      if (!document || !document.cookie) {
        return "en";
      }
      const cookieValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith("NEXT_LOCALE="))
        ?.split("=")[1];
      return cookieValue || "en";
    } else {
      return "en";
    }
  };
  const offerData = [
    {
      title: "customizedProfessional247",
      subTitle: "accessibleDecisionMakingSupport",
      url: "/images/aboutus/offer2.png",
    },
    {
      title: "managerialStrategyReview",
      subTitle: "",
      url: "/images/aboutus/offer3.png",
    },
    {
      title: "competitorAnalysis",
      subTitle: "",
      url: "/images/aboutus/offer4.png",
    },
    {
      title: "allAroundPerformance",
      subTitle: "globalTrendTracking",
      url: "/images/aboutus/offer1.png",
    },
  ];
  return (
    <div className={styles.newAboutUsOffer}>
      <div className={styles.newAboutUsOfferTitle}>{t("whatWeOffer")}</div>
      <div className={styles.newAboutUsOfferContent}>
        {offerData.map((item, index) => (
          <div key={index} className={styles.newAboutUsOfferItem}>
            <Image
              className={styles.newAboutUsOfferItemImg}
              alt=""
              src={item.url}
              width={100}
              height={400}
            />
            <div
              className={
                getLocaleFromCookie() === "en"
                  ? styles.newAboutUsOfferItemMask
                  : styles.newAboutUsOfferItemMaskRow
              }
            >
              <div className={styles.newAboutUsOfferItemTitle}>
                {t(item.title)}
              </div>
              {item.subTitle && (
                <div className={styles.newAboutUsOfferItemTitle}>
                  {t(item.subTitle)}
                </div>
              )}
            </div>
          </div>
        ))}
        <Image
          className={styles.newAboutUsOfferCenterImg}
          alt=""
          src="/images/aboutus/Neobanker.svg"
          width={115.061}
          height={110.55128}
        />
      </div>
    </div>
  );
};
// We are Rapidly Growing
const WeAreRapidlyGrowing = ({ t }: { t: (key: string) => string }) => {
  const [visibleImages, setVisibleImages] = useState<Set<number>>(new Set());
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            const index = imageRefs.current.indexOf(
              entry.target as HTMLDivElement
            );
            if (index !== -1) {
              setVisibleImages((prev) => new Set(prev).add(index));
            }
          }
        });
      },
      {
        threshold: [0.1, 0.3, 0.5, 0.7, 0.9], // 多个阈值
        rootMargin: "300px 0px", // 更早开始预加载
      }
    );

    imageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    return () => observer.disconnect();
  }, []);
  const areaList = [
    {
      area: "CN+HK",
      url: "/images/aboutus/CN+HK.png",
    },
    {
      area: "EU",
      url: "/images/aboutus/EU.png",
    },
    {
      area: "US",
      url: "/images/aboutus/us.png",
    },
  ];
  const timeLineList = [
    {
      date: "Oct,2025",
      name: "Training: MIT Hong Kong Innovation Node",
      title: "betterTeam",
      url: ["/images/timeline/na1.jpg"],
    },
    {
      date: "Apr,2025",
      name: "Strategic Partnership: MoU Signing with Newlink Technology",
      title: "betterTeam",
      url: ["/images/timeline/a1.png"],
    },
    {
      date: "Dec 15,2024",
      name: "Swiss Innovation China Roadshow",
      title: "betterTeam",
      url: [
        "/images/timeline/b1.jpg",
        "/images/timeline/b2.jpg",
        "/images/timeline/b3.png",
        // "/images/timeline/b4.jpg",
      ],
    },
    {
      date: "Dec,2024",
      name: "Beijing-Hong Kong AI Application Accelerator (Dark Horse Venture)",
      title: "betterTeam",
      url: ["/images/timeline/c1.jpg"],
    },
    {
      date: "Dec 6,2024",
      name: "Showcase at HKTDC Entrepreneur Day (E-Day)",
      title: "betterTeam",
      url: [
        "/images/timeline/d1.jpg",
        "/images/timeline/d2.jpg",
        "/images/timeline/d3.jpg",
        "/images/timeline/d4.jpg",
        "/images/timeline/d5.jpg",
      ],
    },
    {
      date: "Oct,2024",
      name: "Corporate Excellence: CHO Appreciation & SME Awards",
      title: "betterTeam",
      url: ["/images/timeline/e1.jpg", "/images/timeline/e2.jpg"],
    },
    {
      date: "Sep,2024",
      name: "PolyU Delegation: Jiangsu Industry-Academia Cooperation Summit",
      title: "betterTeam",
      url: [
        "/images/timeline/f1.jpg",
        "/images/timeline/f2.jpg",
        "/images/timeline/f3.jpg",
        "/images/timeline/f4.jpg",
      ],
    },
    {
      date: "Aug,2024",
      name: "Joint Project: Jiangsu-Hong Kong-Macao University Alliance (JHMUA)-Nanjing University",
      title: "betterTeam",
      url: ["/images/timeline/ng1.jpg", "/images/timeline/ng2.jpg"],
    },
    {
      date: "Jul,2024",
      name: "Excellence Award: The “Chunhui Cup” Oversea Students Innovation and Entrepreneurship Competition（Switzerland）",
      title: "betterTeam",
      url: ["/images/timeline/g1.jpg", "/images/timeline/g2.jpg"],
    },
    {
      date: "Apr,2024",
      name: "ETH & EPFL Sciencepreneurship Summer School (Switzerland)",
      title: "betterTeam",
      url: [
        "/images/timeline/h1.jpg",
        "/images/timeline/h2.jpg",
        "/images/timeline/h3.jpg",
        "/images/timeline/h4.jpg",
        "/images/timeline/h5.jpg",
        "/images/timeline/h6.jpg",
      ],
    },
    {
      date: "Win 2023",
      name: "Product Development: MVP Demo Phase ",
      title: "betterTeam",
      url: ["/images/timeline/i1.jpg"],
    },
    {
      date: "Jul,2023",
      name: "CUPP FinTech Entrepreneurship Bootcamp at Cambridge University",
      title: "betterTeam",
      url: [
        "/images/timeline/j1.webp",
        "/images/timeline/j2.jpg",
        "/images/timeline/j3.jpg",
        "/images/timeline/j4.jpg",
        "/images/timeline/j5.webp",
        "/images/timeline/j6.jpg",
        "/images/timeline/j7.jpg",
      ],
    },
    {
      date: "May,2023",
      name: "Startup Company Established,Digital Financial Services Research Center Limited",
      title: "betterTeam",
      url: ["/images/timeline/k1.webp"],
    },
    {
      date: "May,2023",
      name: "HKSTP Ideation Programme &HKSTP x HYAB",
      title: "betterTeam",
      url: [
        "/images/timeline/l1.jpg",
        "/images/timeline/l2.jpg",
        "/images/timeline/l3.jpg",
        "/images/timeline/l4.jpg",
        "/images/timeline/l5.jpg",
      ],
    },
    {
      date: "Apr,2023",
      name: "Winner: Cyberport University Partnership Programme (CUPP) - Neobank Research Center",
      title: "betterTeam",
      url: [],
    },
    {
      date: "Dec 2022",
      name: "Winner: PolyU GBA Startup Postdoc Programme",
      title: "betterTeam",
      url: [],
    },
    {
      date: "Mar,2023",
      name: "Winner: PolyU Micro Fund (Cohort 2) & HKSTP Lean Launcher program",
      title: "betterTeam",
      url: ["/images/timeline/m1.jpg"],
    },
  ];
  const newAboutUsTimeLineItemStyle = (index: number) => {
    return ({
      scrollSnapAlign: ["start", "none"][index % 2],
    })
  };
  return (
    <div className={styles.newAboutUsRapidly}>
      <div className={styles.newAboutUsRapidlyTitle}>
        {t("weAreRapidlyGrowing")}
      </div>
      <div className={styles.newAboutUsRapidlySubTitle}>
        {t("variousVersionsOfLoremIpsumHaveEvolvedOverTheYears")}
      </div>
      <div className={styles.newAboutUsAsync}>
        {t("ourTeamAcrossDifferntCountryAsyncXxx")}
      </div>
      <div className={styles.newAboutUsPhone}>
        {areaList.map((item, index) => (
          <div key={index} className={styles.newAboutUsRapidlyItem}>
            <div className={styles.newAboutUsRapidlyItemArea}>{item.area}</div>
            <Image
              className={styles.newAboutUsRapidlyItemImg}
              alt=""
              src={item.url}
              width={40}
              height={40}
            />
            {/* <div className={styles.newAboutUsRapidlyItemMask}>
              <div className={styles.newAboutUsRapidlyItemName}>
                {item.name}
              </div>
              <div className={styles.newAboutUsRapidlyItemTitle}>
                {item.title}
              </div>
            </div> */}
          </div>
        ))}
      </div>
      <div className={styles.newAboutUsTimeLine}>
        <div className={styles.newAboutUsTimeLineTitle}>{t("timeline")}</div>
        <div className={styles.newAboutUsTimeLineContent}>
          <div className={styles.newAboutUsTimeLineLeft}>
            {
              timeLineList.filter((_, index) => index % 2 === 1).map((item, index) => (
                <div key={index} className={styles.newAboutUsTimeLineItemLeft}>
                  <div className={styles.newAboutUsTimeLineItemContentLeft}>
                    <div className={styles.newAboutUsTimeLineItemTopBox}>
                      <div className={styles.newAboutUsTimeLineItemDate}>{item.date}</div>
                      <div className={styles.newAboutUsTimeLineItemNameLeft}>{item.name}</div>
                    </div>
                    {/* <div className={styles.newAboutUsTimeLineItemTitle}>{item.title}</div> */}
                    <div className={styles.newAboutUsTimeLineItemImgList}>
                      {
                        item.url && item.url.map((url, imgIndex) => {
                          const globalIndex = index * 10 + imgIndex;
                          if (imgIndex >= 0 && imgIndex < 1) {
                            return (
                              <div key={imgIndex} ref={el => { imageRefs.current[globalIndex] = el }} className={styles.newAboutUsTimeLineItemImgContainer}>
                                {visibleImages.has(globalIndex) ? (
                                  <AntdImage className={styles.newAboutUsTimeLineItemBigImg}
                                    width={341}
                                    height={200}
                                    src={url}
                                    placeholder={
                                      <div style={{
                                        width: 341,
                                        height: 200,
                                        background: '#f5f5f5',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '16px'
                                      }}>
                                        <div>加载中...</div>
                                      </div>
                                    }
                                    preview={{
                                      src: url,
                                    }}
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />) : (
                                  <div style={{
                                    width: 341,
                                    height: 200,
                                    background: '#f5f5f5',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}>
                                    图片加载中...
                                  </div>
                                )}
                                <Image className={styles.newAboutUsTimeLineItemImg} alt="" src="/images/aboutus/Neobanker.png" width={72.85564} height={70} />
                              </div>
                            )
                          } else {
                            return (
                              <div></div>
                            )
                          }
                        })
                      }
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
          <div className={styles.newAboutUsTimeLineCenter}>
            {/* <div className={styles.newAboutUsTimeLineDotOne}>
              <div className={styles.newAboutUsTimeLineDot}></div>
            </div>
            <div className={styles.newAboutUsTimeLineDotTwo}>
              <div className={styles.newAboutUsTimeLineDot}></div>
            </div>
            <div className={styles.newAboutUsTimeLineDotThree}>
              <div className={styles.newAboutUsTimeLineDot}></div>
            </div> */}
            {/* {
              timeLineList.map((item, index) => (
                <div key={index} className={styles.newAboutUsTimeLineDotOne}>
                  <div className={styles.newAboutUsTimeLineDot}></div>
                </div>
              ))
            } */}
          </div>
          <div className={styles.newAboutUsTimeLineRight}>
            {
              timeLineList.filter((_, index) => index % 2 === 0).map((item, index) => (
                <div key={index} className={styles.newAboutUsTimeLineItem} style={newAboutUsTimeLineItemStyle(index)}>
                  <div className={styles.newAboutUsTimeLineItemContent}>
                    <div className={styles.newAboutUsTimeLineItemTopBoxRight}>
                      <div className={styles.newAboutUsTimeLineItemDate}>{item.date}</div>
                      <div className={styles.newAboutUsTimeLineItemName}>{item.name}</div>
                    </div>
                    {/* <div className={styles.newAboutUsTimeLineItemTitle}>{item.title}</div> */}
                    <div className={styles.newAboutUsTimeLineItemImgListRight}>
                      {
                        item.url && item.url.map((url, imgIndex) => {
                          const globalIndex = index * 10 + imgIndex;
                          if (imgIndex >= 0 && imgIndex < 1) {
                            return (
                              <div key={imgIndex} ref={el => { imageRefs.current[globalIndex] = el }} className={styles.newAboutUsTimeLineItemImgContainer}>
                                {visibleImages.has(globalIndex) ? (
                                  <AntdImage className={styles.newAboutUsTimeLineItemBigImg}
                                    width={341}
                                    height={200}
                                    src={url}
                                    placeholder={
                                      <div style={{
                                        width: 341,
                                        height: 200,
                                        background: '#f5f5f5',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '16px'
                                      }}>
                                        <div>加载中...</div>
                                      </div>
                                    }
                                    preview={{
                                      src: url,
                                    }}
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />) : (
                                  <div style={{
                                    width: 341,
                                    height: 200,
                                    background: '#f5f5f5',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}>
                                    图片加载中...
                                  </div>
                                )}
                                <Image className={styles.newAboutUsTimeLineItemImg} alt="" src="/images/aboutus/Neobanker.png" width={72.85564} height={70} />
                              </div>
                            )
                          } else {
                            return (
                              <div></div>
                            )
                          }
                        })
                      }
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
      {/* <div className={styles.newAboutUsTimeLineItemMoreContainer}>
        <div className={styles.newAboutUsTimeLineItemMoreText}>{t('readMore')}</div>
        <Image className={styles.newAboutUsTimeLineItemMore} alt="" src="/images/aboutus/rightArrow.png" width={16} height={16} />
      </div> */}
    </div>
  );
};

// Our team
const OurTeam = ({ t }: { t: (key: string) => string }) => {
  const [activeTopIndex, setActiveTopIndex] = useState(0);
  const [activeBottomIndex, setActiveBottomIndex] = useState(0);
  const [teamTopNewList, setTeamTopNewList]: any = useState([]);
  const [teamBottomNewList, setTeamBottomNewList]: any = useState([]);

  // 实时获取窗口宽度
  const [windowWidth, setWindowWidth] = useState(0);
  useEffect(() => {
    // 初始化获取宽度
    setWindowWidth(window.innerWidth);
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    // 添加窗口大小变化事件监听
    window.addEventListener('resize', handleResize);
    // 清理函数：移除事件监听
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 每页显示的数量
  const [ITEMS_PER_PAGE, setITEMS_PER_PAGE] = useState(4);
  // const ITEMS_PER_PAGE = 4;
  useEffect(() => {
    // windowWidth - 240 - ( num -1 ) * 20 = 350 * num
    const num = Math.max(1, Math.floor((windowWidth - 235) / 370));
    setITEMS_PER_PAGE(num);
  }, [windowWidth]);

  // 计算总页数
  const topTotalPages = Math.ceil(teamTopNewList.length / ITEMS_PER_PAGE);
  const bottomTotalPages = Math.ceil(teamBottomNewList.length / ITEMS_PER_PAGE);

  // 获取当前页的数据
  const getCurrentPageData = (list: any[], currentIndex: number) => {
    const startIndex = currentIndex * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return list.slice(startIndex, endIndex);
  };

  // 切换到上一页
  const handlePrevPage = (type: "top" | "bottom") => {
    if (type === "top") {
      setActiveTopIndex((prev) => (prev > 0 ? prev - 1 : topTotalPages - 1));
    } else {
      setActiveBottomIndex((prev) =>
        prev > 0 ? prev - 1 : bottomTotalPages - 1
      );
    }
  };

  // 切换到下一页
  const handleNextPage = (type: "top" | "bottom") => {
    if (type === "top") {
      setActiveTopIndex((prev) => (prev < topTotalPages - 1 ? prev + 1 : 0));
    } else {
      setActiveBottomIndex((prev) =>
        prev < bottomTotalPages - 1 ? prev + 1 : 0
      );
    }
  };

  // 生成分页指示器
  const renderPaginationDots = (
    totalPages: number,
    activeIndex: number,
    type: "top" | "bottom"
  ) => {
    if (totalPages < 2) {
      return (
        <>
          <div
            style={{ marginRight: "6px", userSelect: "none" }}
            className={`${styles.newAboutUsTeamSubTitleButtonItem}`}
          >
            <Image
              style={{ userSelect: "none" }}
              className={styles.newAboutUsTeamSubTitleButtonImg}
              alt=""
              src="/images/aboutus/tm8.png"
              width={7}
              height={9}
            />
          </div>
          <div
            style={{ marginLeft: "6px", userSelect: "none" }}
            className={`${styles.newAboutUsTeamSubTitleButtonItem}`}
          >
            <Image
              style={{ transform: "rotate(180deg)", userSelect: "none" }}
              className={styles.newAboutUsTeamSubTitleButtonImg}
              alt=""
              src="/images/aboutus/tm8.png"
              width={7}
              height={9}
            />
          </div>
        </>
      );
    } else {
      const isFirstPage = activeIndex === 0;
      const isLastPage = activeIndex === totalPages - 1;
      return (
        <>
          <div
            onClick={!isFirstPage ? () => handlePrevPage(type) : undefined}
            style={{ marginRight: "6px", userSelect: "none" }}
            className={`${styles.newAboutUsTeamSubTitleButtonItem} ${!isFirstPage ? styles.newAboutUsTeamSubTitleButtonItemActive : ""
              }`}
          >
            {isFirstPage ? <Image
              style={{ userSelect: "none" }}
              className={styles.newAboutUsTeamSubTitleButtonImg}
              alt=""
              src="/images/aboutus/tm8.png"
              width={7}
              height={9}
            />:
            <LeftOutlined className={styles.newAboutUsTeamSubTitleButtonImg} ></LeftOutlined>}
          </div>
          <div
            style={{ userSelect: "none" }}
            onClick={!isLastPage ? () => handleNextPage(type) : undefined}
            className={`${styles.newAboutUsTeamSubTitleButtonItem} ${!isLastPage ? styles.newAboutUsTeamSubTitleButtonItemActive : ""
              }`}
          >
            {/* <Image style={{userSelect: 'none'}}  className={styles.newAboutUsTeamSubTitleButtonImg} alt="" src="/images/aboutus/tm7.png" width={7} height={9} /> */}
            <RightOutlined className={styles.newAboutUsTeamSubTitleButtonImg} />
          </div>
        </>
      );
    }
  };

  const teamTopList = [
    {
      name: "Prof. Qiang WU",
      tag: "Chief Academic Officer",
      title:
        "https://www.polyu.edu.hk/af/people/academic-staff/prof-qiang-wu/",
      url: "/images/aboutus/avatar/Prof. Qiang WU.jpg",
    },
    {
      name: "Prof. Zhuo June CHENG",
      tag: "Chief Happiness Officer",
      title:
        "https://www.polyu.edu.hk/af/people/academic-staff/prof-june-cheng/",
      url: "/images/aboutus/avatar/Prof. Zhuo June CHENG.jpg",
    },
    {
      name: "Prof. Wilson TONG",
      tag: "Chief Wisdom Officer",
      title:
        "https://www.polyu.edu.hk/af/people/academic-staff/prof-wilson-tong/",
      url: "/images/aboutus/avatar/Prof. Wilson TONG.jpg",
    },
    {
      name: "Prof. Li JIANG",
      tag: "Chief Knowledge Officer",
      title:
        "https://www.polyu.edu.hk/af/people/academic-staff/prof-jiang-li/",
      url: "/images/aboutus/avatar/Prof. Li JIANG.jpg",
    },
    {
      name: "Prof. Derek CHUNG",
      tag: "Chief Entertainment Officer",
      title:
        "https://www.polyu.edu.hk/af/people/academic-staff/prof-derek-chung/",
      url: "/images/aboutus/avatar/Prof. Derek CHUNG.jpg",
    },
  ];
  const teamBottomList = [
    {
      name: "Dr. Wenjie Xu",
      tag: "Cheif X-anything Officer",
      title:
        "",
      url: "/images/aboutus/avatar/Dr. Wenjie Xu.jpg",
    },
    {
      name: "Wan Yeung",
      tag: "UX/UI Lead & Developer",
      title:
        "",
      url: "/images/aboutus/avatar/Wan Yeung.jpg",
    },
    {
      name: "Dr. Donglian MA",
      tag: "Chief Web3 Officer",
      title:
        "",
      url: "/images/aboutus/avatar/MaBo.jpg",
    },
    {
      name: "Dr. Jia Linlin",
      tag: "Chief AI Officer",
      title:
        "",
      url: "/images/aboutus/avatar/Dr. Jia Linlin.jpg",
    },
    {
      name: "Dr. Lin Yue",
      tag: "瑞士市场CMO",
      title:
        "",
      url: "/images/aboutus/avatar/Dr. Lin Yue.jpg",
    },
    {
      name: "Arthur",
      tag: "CMO",
      title:
        "",
      url: "/images/aboutus/avatar/Arthur.jpg",
    },
    {
      name: "徐斌",
      tag: "Engineering Manager",
      title:
        "",
      url: "/images/aboutus/avatar/XuBin.jpg",
    },
    {
      name: "龚文武",
      tag: "Product Manager",
      title:
        "",
      url: "/images/aboutus/avatar/龚文武.jpg",
    },
    {
      name: "魏靖婷",
      tag: "UX/UI",
      title:
        "",
      url: "/images/aboutus/avatar/WeiJingTing.jpg",
    },
    {
      name: "聂志刚",
      tag: "Fintech Research Analyst",
      title:
        "",
      url: "/images/aboutus/avatar/聂志刚.jpg",
    },
  ];
  const initOurTeam = useCallback(async () => {
    const response = await getOurTeam().catch(() => {
      setTeamTopNewList(teamTopList);
      setTeamBottomNewList(
        appendManualCoreTeamMembers(
          teamBottomList.filter((member) => shouldIncludeTeamMember(member.name))
        )
      );
    });
    console.log("teamTopNewList", response);
    if (response && response.length > 0) {
      let teamTopNewList: any = [];
      let teamBottomNewList: any = [];
      response.forEach((element: any) => {
        if (!shouldIncludeTeamMember(element.name)) {
          return;
        }

        if (element.type == "1") {
          teamTopNewList.push({
            name: getTeamMemberName(element.name),
            tag: getTeamMemberRole(element.name, element.level),
            title: element.description,
            url: element.profilePicture,
          });
        } else if (element.type == "2") {
          teamBottomNewList.push({
            name: getTeamMemberName(element.name),
            tag: getTeamMemberRole(element.name, element.level),
            title: element.description,
            url: element.profilePicture,
          });
        }
      });
      setTeamTopNewList(teamTopNewList || teamTopList);
      setTeamBottomNewList(
        appendManualCoreTeamMembers(teamBottomNewList || teamBottomList)
      );
    }
  }, []);
  useEffect(() => {
    initOurTeam();
  }, [initOurTeam]);
  return (
    <div className={styles.newAboutUsTeam}>
      <div className={styles.newAboutUsTeamTitle}>{t("ourTeam")}</div>
      <div className={styles.newAboutUsTeamSubTitle}>
        <div className={styles.newAboutUsTeamSubTitleText}>
          {t("advisoryBoard")}
        </div>
        <div className={styles.newAboutUsTeamSubTitleButton}>
          {/* <div style={{marginRight: '6px'}} className={`${styles.newAboutUsTeamSubTitleButtonItem} ${activeTopIndex > 0 ? styles.newAboutUsTeamSubTitleButtonItemActive : ''}`}>
            <Image className={styles.newAboutUsTeamSubTitleButtonImg} alt="" src="/images/aboutus/tm8.svg" width={7} height={9} />
          </div>
          <div className={`${styles.newAboutUsTeamSubTitleButtonItem} ${activeTopIndex === 0 ? styles.newAboutUsTeamSubTitleButtonItemActive : ''}`}>
            <Image className={styles.newAboutUsTeamSubTitleButtonImg} alt="" src="/images/aboutus/tm7.svg" width={7} height={9} />
          </div> */}
          {/* 左箭头 */}
          {/* <div
            style={{marginRight: '6px'}}
            className={`${styles.newAboutUsTeamSubTitleButtonItem} ${styles.newAboutUsTeamSubTitleButtonArrow}`}
            onClick={() => handlePrevPage('top')}
          >
            <Image
              className={styles.newAboutUsTeamSubTitleButtonImg}
              alt="Previous"
              src="/images/aboutus/tm8.svg"
              width={7}
              height={9}
            />
          </div> */}
          {/* 分页指示器 */}
          {renderPaginationDots(topTotalPages, activeTopIndex, "top")}
          {/* 右箭头 */}
          {/* <div
            style={{marginLeft: '6px'}}
            className={`${styles.newAboutUsTeamSubTitleButtonItem} ${styles.newAboutUsTeamSubTitleButtonArrow}`}
            onClick={() => handleNextPage('top')}
          >
            <Image
              className={styles.newAboutUsTeamSubTitleButtonImg}
              alt="Next"
              src="/images/aboutus/tm7.svg"
              width={7}
              height={8}
            />
          </div> */}
        </div>
      </div>
      <div className={styles.newAboutUsTeamContent}>
        {getCurrentPageData(teamTopNewList, activeTopIndex).map(
          (item: any, index) => (
            <div key={index} className={styles.newAboutUsTeamItem}>
              <div className={styles.newAboutUsTeamItemContent}>
                <Tooltip placement="bottom" title={item.name}>
                  <div className={styles.newAboutUsTeamItemName}>
                    {item.name}
                  </div>
                </Tooltip>
                <div className={styles.newAboutUsTeamItemTag}>{item.tag}</div>
                {/* <div className={styles.newAboutUsTeamItemTitle}>
                  {item.title}
                </div> */}
              </div>
              <Image
                className={styles.newAboutUsTeamItemImg}
                alt=""
                src={item.url}
                width={90}
                height={90}
              />
            </div>
          )
        )}
      </div>
      <div className={styles.newAboutUsTeamSubTitle}>
        <div className={styles.newAboutUsTeamSubTitleText}>{t("coreTeam")}</div>
        <div className={styles.newAboutUsTeamSubTitleButton}>
          {/* <div style={{marginRight: '6px'}} className={`${styles.newAboutUsTeamSubTitleButtonItem} ${activeBottomIndex > 0 ? styles.newAboutUsTeamSubTitleButtonItemActive : ''}`}>
            <Image className={styles.newAboutUsTeamSubTitleButtonImg} alt="" src="/images/aboutus/tm8.svg" width={7} height={9} />
          </div>
          <div className={`${styles.newAboutUsTeamSubTitleButtonItem} ${activeBottomIndex === 0 ? styles.newAboutUsTeamSubTitleButtonItemActive : ''}`}>
            <Image className={styles.newAboutUsTeamSubTitleButtonImg} alt="" src="/images/aboutus/tm7.svg" width={7} height={9} />
          </div> */}
          {/* 左箭头 */}
          {/* <div
            style={{marginRight: '6px'}}
            className={`${styles.newAboutUsTeamSubTitleButtonItem} ${styles.newAboutUsTeamSubTitleButtonArrow}`}
            onClick={() => handlePrevPage('bottom')}
          >
            <Image
              className={styles.newAboutUsTeamSubTitleButtonImg}
              alt="Previous"
              src="/images/aboutus/tm8.svg"
              width={7}
              height={9}
            />
          </div> */}
          {/* 分页指示器 */}
          {renderPaginationDots(bottomTotalPages, activeBottomIndex, "bottom")}
          {/* 右箭头 */}
          {/* <div
            style={{marginLeft: '6px'}}
            className={`${styles.newAboutUsTeamSubTitleButtonItem} ${styles.newAboutUsTeamSubTitleButtonArrow}`}
            onClick={() => handleNextPage('bottom')}
          >
            <Image
              className={styles.newAboutUsTeamSubTitleButtonImg}
              alt="Next"
              src="/images/aboutus/tm7.svg"
              width={7}
              height={9}
            />
          </div> */}
        </div>
      </div>
      <div
        className={styles.newAboutUsTeamContent}
        style={{ marginBottom: "0px" }}
      >
        {getCurrentPageData(teamBottomNewList, activeBottomIndex).map(
          (item: any, index) => (
            <div key={index} className={styles.newAboutUsTeamItem}>
              <div className={styles.newAboutUsTeamItemContent}>
                <Tooltip placement="bottom" title={item.name}>
                  <div className={styles.newAboutUsTeamItemName}>
                    {item.name}
                  </div>
                </Tooltip>
                <div className={styles.newAboutUsTeamItemTag}>{item.tag}</div>
                {/* <div className={styles.newAboutUsTeamItemTitle}>
                  {item.title}
                </div> */}
              </div>
              <Image
                className={styles.newAboutUsTeamItemImg}
                alt=""
                src={item.url}
                width={90}
                height={90}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
};

// Corporate Philosophy
const CorporatePhilosophy = ({ t }: { t: (key: string) => string }) => {
  const [form] = Form.useForm();
  const ContactUsEmail = async (values: FieldType) => {
    try {
      if (!values.email) {
        message.error("请填写所有必填字段");
        return;
      }
      await getContactUs(values.email);
      form.resetFields();
      message.success("发送成功");
    } catch (error) {
      message.error("发送失败，请重试");
    }
  };
  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    console.log("Success:", values);
    ContactUsEmail(values);
  };
  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
  };
  const corporateList = [
    {
      url: "/images/aboutus/cp1.svg",
      name: "happiness",
    },
    {
      url: "/images/aboutus/cp2.svg",
      name: "passion",
    },
    {
      url: "/images/aboutus/cp3.svg",
      name: "professional",
    },
  ];
  // 关于我们的中间展示数据
  const newBottomRightMiddleLinks = [
    {
      url: "",
      name: "neobanks",
    },
    {
      url: "",
      name: "dataDriven",
    },
    {
      url: "/images/footer/Sparkle.svg",
      name: "innovation",
    },
  ];
  return (
    <div className={styles.newAboutUsCorporatePhilosophy}>
      <div className={styles.newAboutUsCorporatePhilosophyTitle}>
        {t("corporatePhilosophy")}
      </div>
      <div className={styles.newAboutUsCorporateContent}>
        {corporateList.map((item, index) => (
          <div key={index} className={styles.newAboutUsCorporateItem}>
            <Image
              className={styles.newAboutUsCorporateItemImg}
              alt=""
              src={item.url}
              width={460}
              height={270}
            />
            <div className={styles.newAboutUsCorporateItemName}>
              {t(item.name)}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.newAboutUsContactUs}>
        <div className={styles.newAboutUsContactUsLeft}>
          <div className={styles.newAboutUsContactUsLeftTitle}>
            {t("supportOrWorkWithUs")}
          </div>
          <div className={styles.newAboutUsContactUsLeftMiddle}>
            {newBottomRightMiddleLinks.map((item, index) => (
              <div
                className={styles.newBottomRightMiddleItem}
                key={index || item.name}
              >
                {item.url && (
                  <Image
                    className={styles.newBottomRightMiddleIcon}
                    src={item.url}
                    alt={item.name}
                    width={10.492}
                    height={10.489}
                  />
                )}
                <div className={styles.newBottomRightMiddleItemText}>
                  {t(item.name)}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.newAboutUsContactUsLeftBottom}>
            {/* <Input className={styles.newAboutUsContactUsLeftMiddleInput} placeholder="Enter your email" /> */}
            <Form
              form={form}
              name="basic"
              labelCol={{ span: 0 }}
              wrapperCol={{ span: 24 }}
              initialValues={{ remember: true }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
              className={styles.noFocusFormItem}
            >
              <Form.Item<FieldType>
                label={null}
                name="email"
                rules={[
                  { required: true, message: t("emailError2") },
                  {
                    validator: (_, value) => {
                      if (value && !validateEmailFormat(value)) {
                        return Promise.reject(new Error(t("emailError")));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <div className={styles.newAboutUsContactUsLeftBottomInput}>
                  <Input
                    className={styles.newAboutUsContactUsLeftMiddleInput}
                    placeholder={t("email")}
                  />
                </div>
              </Form.Item>
            </Form>
            <div
              onClick={() => form.submit()}
              className={styles.newAboutUsContactUsLeftBottomButton}
            >
              {t("contactUs")}{" "}
            </div>
          </div>
        </div>
        <div className={styles.newAboutUsContactUsRight}>
          <Image
            className={styles.newAboutUsContactUsRightImg}
            alt=""
            src="/images/aboutus/cp4.svg"
            width={134}
            height={50}
          />
        </div>
      </div>
    </div>
  );
};

// Similar Company
const SwiperCarousel = () => {
  const [partnerList, setPartnerList] = useState([
    {
      createdAt: "",
      description: "",
      id: "",
      logoLink: "",
      name: "",
      status: "",
      type: "",
      updatedAt: "",
      websiteLink: "",
    },
  ]);
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
    const response = await getOurPartner();
    console.log("partnerList", response);
    const normalizedPartnerList = Array.isArray(response)
      ? response.map((partner) => ({
          ...partner,
          logoLink: resolveAssetUrl(partner.logoLink, config.backendApiUrl),
        }))
      : [];
    setFailedPartnerLogoKeys(new Set());
    setPartnerList(normalizedPartnerList);
    // setPartnerList(response ? [...response].reverse() : []);
  }, []);
  useEffect(() => {
    initPartner();
  }, [initPartner]);

  return (
    <div
      className="swiper-container"
      style={{ width: "100%", padding: "30px 48px 0px 48px" }}
    >
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
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
        breakpoints={{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
        // 事件监听
        onSlideChange={(swiper) => { }}
        onSwiper={(swiper) => {
          console.log("Swiper initialized: ", swiper);
          // 可以在这里保存swiper实例到状态
        }}
      >
        {partnerList.map((slide, index) => {
          const partnerKey = slide.id || slide.name || `partner-${index}`;
          const logoSource =
            failedPartnerLogoKeys.has(partnerKey) || !slide.logoLink
              ? "/images/defaultBank.svg"
              : slide.logoLink;

          return (
          <SwiperSlide className={styles.swiperSlide} key={partnerKey}>
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <img
                src={logoSource}
                alt={slide.name || "Partner logo"}
                onError={() => handlePartnerLogoError(partnerKey)}
                style={{
                  height: "50px",
                  // maxWidth: '100%',
                  // maxHeight: '100%',
                  // objectFit: 'contain', // 保持图片比例
                }}
              />
            </div>
          </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

const AboutUs: FunctionComponent = () => {
  const t = useTranslations("AboutUs");
  const [isUserAccountMenuOpen, setUserAccountMenuOpen] = useState(false);

  const openUserAccountMenu = useCallback(() => {
    setUserAccountMenuOpen(true);
  }, []);

  const closeUserAccountMenu = useCallback(() => {
    setUserAccountMenuOpen(false);
  }, []);

  const onLogoRedHContainerClick = useCallback(() => {
    // Add your code here
  }, []);
  return (
    <>
      <div className={styles.newAboutUs}>
        <div className={styles.newAboutUsTitle}>{t("aboutUs")}</div>
        <div className={styles.newAboutUsTop}>
          <div className={styles.newAboutUsTopTitle}>
            {t("aboutUsDescription")}
          </div>
          <div className={styles.newAboutUsTopSubTitle}>
            {t("aboutUsTitle")}
          </div>
          <div className={styles.newAboutUsTopIcon}>
            <div className={styles.newAboutUsTopIconNbg}>
              <img
                className={styles.newAboutUsTopIconNg}
                src="/images/aboutus/neobankerIcon.png"
                alt="neobankerIcon"
              />
            </div>
            <img
              className={styles.newAboutUsTopIconBg}
              src="/images/aboutus/bgLine.png"
              alt="bgLine"
            />
          </div>
        </div>
      </div>
      <WhatWeOffer t={t} />
      <WeAreRapidlyGrowing t={t} />
      <OurTeam t={t} />
      <CorporatePhilosophy t={t} />
      <div className={styles.similarCompany}>
        <div className={styles.similarCompanyTitle}>{t("partner")}</div>
        <SwiperCarousel />
      </div>
      {isUserAccountMenuOpen && (
        <PortalPopup
          overlayColor="rgba(113, 113, 113, 0.3)"
          placement="Centered"
          onOutsideClick={closeUserAccountMenu}
        >
          <UserAccountMenu onClose={closeUserAccountMenu} />
        </PortalPopup>
      )}
    </>
  );
};

export default AboutUs;
