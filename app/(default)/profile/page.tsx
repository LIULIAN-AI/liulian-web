'use client';
import {  UserButton,useClerk } from '@clerk/nextjs';
import { FunctionComponent, useState, useCallback, useEffect,useRef,  } from "react";
import { useRouter } from 'next/navigation';
import UserAccountMenu from "components/UserAccountMenu";
import BankMenuOption2, { Company } from '@/components/BankMenuOption2';
import styles from "app/css/Profile.module.css";
import Footer from "@/components/ui/footer";
import { PostEmail, InviteRequest,getPreference,savePreference, savePreferenceBank,getPreferenceBank,getNotificationPreference, saveNotificationPreference, getAccount, getEmails, sendSelectEmail, sendPemenantPassword,sendTwoStep } from "@/app/api/profile/profile";
interface CheckboxItem {
  label: string;
  isChecked: boolean;
  value?: any; // 可选的值字段
}
const Profile: FunctionComponent = () => {
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

    const DotIcon = () => {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
          <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z" />
        </svg>
      )
    }



    const InvitePage = () => {
       // 定义Invite User 页面
   // 存储输入的邮箱（支持逗号分隔多个邮箱）
     const [emails, setEmails] = useState('');
     // 加载状态
     const [isLoading, setIsLoading] = useState(false);
     // 错误信息
     const [error, setError] = useState('');

     // 处理输入框变化
     const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
       setEmails(e.target.value);
       // 清除错误提示
       if (error) setError('');
     };
    const handleSendInvite = async () => {
        // 简单验证
        if (!emails.trim()) {
          setError('Please enter email');
          return;
        }

        // 验证邮箱格式（简单验证）
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailList = emails.split(',').map(email => email.trim());
        const invalidEmails = emailList.filter(email => !emailRegex.test(email));

        if (invalidEmails.length > 0) {
          setError(`Invali Email: ${invalidEmails.join(', ')}`);
          return;
        }

        try {
          setIsLoading(true);
          // 调用 PostEmail API 函数
          // const requestData: InviteRequest = { emails: emailList };
          const requestData: any = { emails: emailList };
          const result = await PostEmail(requestData);

          if (result.success) {
                  alert('邀请已发送！');
                  setEmails(''); // 清空输入框
          } else {
                  throw new Error(result.message || '发送失败，请稍后重试');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : '发送失败，请稍后重试');
        } finally {
          setIsLoading(false);
        }
      };
      return (
        <div className={styles.inviteContainer}>
              <div className={styles.inviteTitle}>
                <div><span className={styles.inviteUserSpan}>Invite user</span></div>
                <div className={styles.inviteRewards}>
                  <span className={styles.inviteRewardsSpan}>
                    Invite new users to earn subscription rewards.
                  </span>
                </div>
              </div>

              <div className={styles.inviteSeparator}>
                <div className={styles.inviteLine}></div>
              </div>

              <div className={styles.inviteContainer01}>
                <div className={styles.inviteContainer02}>
                  <div className={styles.inviteContainer03}>
                    <div className={styles.inviteLabel}>
                      <div><span className={styles.inviteLabel01Span}>Invite members</span></div>
                    </div>
                    <div className={styles.inviteSubscription}>
                      <span className={styles.inviteSubscriptionSpan}>
                        Invite new subscribers via email, and if the invited subscriber registers successfully, both you and the invited subscriber are rewarded with a 7-day subscription.
                      </span>
                    </div>
                  </div>

                  <div data-state="Default" data-style="New York" className={styles.inviteSelect}>
                    <div className={styles.inviteSelectInput}>
                      <div className={styles.inviteSelect01}>
                        <input
                                    type="text"
                                    id="invite-email"
                                    value={emails}
                                    onChange={handleEmailChange}
                                    placeholder="Emails..."
                                    className={styles.inviteSelect01Span}
                                    disabled={isLoading}
                                  />
                      </div>
                      {/* 错误提示 */}
                              {error && (
                                <div style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                                  {error}
                                </div>
                      )}
                    </div>
                  </div>

                  {/* 发送按钮（添加点击事件和加载状态） */}
                  <div
                          data-show-label="true"
                          data-show-leading-icon="false"
                          data-show-trailing-icon="false"
                          data-size="Default"
                          data-state={isLoading ? "Loading" : "Default"}
                          data-style="New York"
                          data-variant="Primary"
                          className={styles.inviteButton}
                          onClick={handleSendInvite}
                          style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                        >
                          <div>
                            <span className={styles.inviteButton01Span}>
                              {isLoading ? 'Sending...' : 'Send invite'}
                            </span>
                          </div>
                  </div>
                </div>
              </div>
            </div>
      );
    };


    // 新增Preference页面内容组件

    const PreferencePage = () => {
      const { user } = useClerk();


      interface TopicItem {
        label: string;
        isChecked: boolean;
      }
      // 前端label与后端字段的映射关系
    const labelToFieldMap:any = {
      "News & Reports": "news&reports",
      "Company": "Company",
      "Products": "Products",
      "Web 3.0": "Web3",
      "Banks Statistics": "BanksStatistics",
      "Financials": "Financials",
      "Staff": "Staff",
      "Tech": "Tech",
      "Compliance": "Compliance"
    };
      // 用于存储上方各个主题 checkbox 的选中状态
        const [topicCheckboxes, setTopicCheckboxes] = useState<TopicItem[]>([
          { label: "News & Reports", isChecked: false },
          { label: "Company", isChecked: false },
          { label: "Products", isChecked: false },
          { label: "Web 3.0", isChecked: false },
          { label: "Banks Statistics", isChecked: false },
          { label: "Financials", isChecked: false },
          { label: "Staff", isChecked: false },
          { label: "Tech", isChecked: false },
          { label: "Compliance", isChecked: false },
        ]);
      // 用于控制“Enable personalized AI”的选中状态
        const [enablePersonalizedAI, setEnablePersonalizedAI] = useState(false);
        const [isLoading, setIsLoading] = useState(false);

      // 从后端获取偏好数据（使用getPreference API组件）
      const fetchPreferences = async () => {


        setIsLoading(true);
        try {
          // 调用getPreference API组件，传入用户ID
          const topicPreferenceData:any = await getPreference(user?.id ?? '');

          // 仅当数据存在时更新状态
          if (topicPreferenceData && Object.keys(topicPreferenceData).length > 0) {
            setTopicCheckboxes(prev =>
              prev.map((item:any) => ({
               ...item,
                // 根据映射关系设置勾选状态（默认保持原状态）
                isChecked: topicPreferenceData[labelToFieldMap[item.label]]?? item.isChecked
              }))
            );
            // 同时更新enablePersonalizedAI状态（如果后端返回该字段）
            if (topicPreferenceData.enablePersonalizedAI!== undefined) {
              setEnablePersonalizedAI(topicPreferenceData.enablePersonalizedAI);
            }
          }
        } catch (error) {
          console.error("Error fetching preferences:", error);
        } finally {
          setIsLoading(false);
        }
      };

      // 组件挂载时获取数据
      useEffect(() => {
        fetchPreferences();
      }, [user?.id]);
    // 处理上方主题 checkbox 选中状态变化
      const handleTopicCheckboxChange = (index: number) => {
        setTopicCheckboxes(prev =>
            prev.map((item, i) => {
              // 只有当前索引的项才创建新对象，其他项保持不变
              if (i === index) {
                return { ...item, isChecked:!item.isChecked }; // 新对象（新引用）
              }
              return item; // 其他项保持原引用
            })
          );
      };
  // 处理“Enable personalized AI” checkbox 选中状态变化
    const handleEnableAIChange = () => {
      const newState =!enablePersonalizedAI;
      setEnablePersonalizedAI(newState);
      if (!newState) {
        // 若从勾选变为取消勾选，可根据需求决定是否要做额外操作，比如清空已选主题（这里简单示例，可灵活调整）
        setTopicCheckboxes((prev) =>
          prev.map((item) => ({ ...item, isChecked: false }))
        );
      }
    };
    // 发送偏好数据到后端
      const sendPreferences = async () => {
        if (!user?.id) return;

        // 转换为后端需要的格式（使用映射关系）
        const payload = {
          enablePersonalizedAI,
         ...topicCheckboxes.reduce((acc, item) => {
            acc[labelToFieldMap[item.label]] = item.isChecked;
            return acc;
          }, {} as Record<string, boolean>)
        };


        try {
          // 假设使用savePreference API组件发送数据
          await savePreference({
            userId:user.id,
            data:payload
          });
        } catch (error) {
          console.error("Error sending preferences:", error);
        }
      };
    // 当启用状态变化时发送数据
      useEffect(() => {
        sendPreferences();
      }, [enablePersonalizedAI]);
//       关注银行================================================================================================================================

      interface BankItem {
          name: string;
          region: string;
          isFollowing: boolean;
        }

        // 银行列表状态
        const [bankList, setBankList] = useState<BankItem[]>([
          { name: "ZA Bank", region: "Hong Kong", isFollowing: true },
          { name: "Revolut", region: "UK", isFollowing: true },
          { name: "PayPay", region: "Japan", isFollowing: false },
          { name: "Paytm", region: "India", isFollowing: false },
          { name: "Cowrywise", region: "Nigeria", isFollowing: true },
        ]);
        const [searchValue, setSearchValue] = useState('');
          const [searchResults, setSearchResults] = useState<any[]>([]);
          const [showDropdown, setShowDropdown] = useState(false);
          const inputRef = useRef<HTMLInputElement>(null);
          const debounceTimer = useRef<NodeJS.Timeout | null>(null);
          const router = useRouter();

          // 搜索输入处理（防抖+接口请求）
          const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setSearchValue(value);

            if (debounceTimer.current) clearTimeout(debounceTimer.current);

            if (value.trim() === '') {
              setSearchResults([]);
              setShowDropdown(false);
              return;
            }

            debounceTimer.current = setTimeout(async () => {
              try {
                const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_API_URL + `/homepage/search?keyword=${encodeURIComponent(value)}&type=company`);

                if (!res.ok) {
                  console.log("无数据");
                  setSearchResults([]);
                  setShowDropdown(false);
                  return;
                }

                const data = await res.json();
                const companies = (data.companies || []).map((item: any) => ({
                  id: item.id,
                  companySortId: item.companySortId,
                  name: item.name,
                  locationSortId: item.locationName || item.locationSortId,
                }));

                setSearchResults(companies);
                setShowDropdown(companies.length > 0);
              } catch (err) {
                console.error('搜索请求失败:', err);
                setSearchResults([]);
                setShowDropdown(false);
              }
            }, 300);
          };

          // 保持原有搜索逻辑的事件处理
          const handleBlur = () => {
            setTimeout(() => setShowDropdown(false), 200);
          };

          const handleFocus = () => {
            if (searchResults.length > 0) setShowDropdown(true);
          };

          const handleSelect = (company: any) => {
            setSearchValue(company.name);
            setShowDropdown(false);
            const sortId = company.companySortId || company.id;


              // 检查bankList中是否已存在该公司（根据name或id判断）
              const isAlreadyExists = bankList.some(
                (item:any) => item.name === company.name || item.id === sortId
              );

              // 若不存在，则添加到bankList
              if (!isAlreadyExists) {
                setBankList(prev => [
                 ...prev,
                  {
                    id: sortId, // 可选：添加id便于后续判断
                    name: company.name,
                    region: company.locationSortId || 'Unknown',
                    isFollowing: true
                  }
                ]);
              }
    //         router.push(`/bank-info/${sortId}/overview`);
          };

          const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (searchValue.trim() === '') return;

              if (searchResults.length > 0) {
                setShowDropdown(true);
              } else {
                alert(`未找到与"${searchValue}"相关的银行`);
              }
            }
          };
        // 下拉框状态管理
        const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
        const dropdownRefs = useRef<(HTMLDivElement | null)[]>([]);
        // 带 Bank 尾缀的状态变量
        const [enablePersonalizedAIBank, setEnablePersonalizedAIBank] = useState(false);
        const [isLoadingBank, setIsLoadingBank] = useState(false);
        const fetchBankPreferences = async () => {
           setIsLoadingBank(true);
           try {
             if (!user?.id) return;

             // 调用银行偏好专用API
            //  const bankPreferenceData = await getBankPreference(user.id);
            const bankPreferenceData:any = {
              followedBanks:{
                name: ''
              },
              enablePersonalizedAIBank: undefined
            }
             // 仅当数据存在时更新状态
             if (bankPreferenceData && Object.keys(bankPreferenceData).length > 0) {
               // 更新银行关注状态
               setBankList(prevBanks =>
                 prevBanks.map(bank => ({
                  ...bank,
                   // 从后端数据中获取对应银行的关注状态，默认保持原有状态
                   isFollowing: bankPreferenceData.followedBanks?.[bank.name]?? bank.isFollowing
                 }))
               );

               // 更新AI启用状态（如果后端返回该字段）
               if (bankPreferenceData.enablePersonalizedAIBank!== undefined) {
                 setEnablePersonalizedAIBank(bankPreferenceData.enablePersonalizedAIBank);
               }
             }
           } catch (error) {
             console.error("获取银行偏好数据失败:", error);
           } finally {
             setIsLoadingBank(false);
           }
         };
        const [filteredBankList, setFilteredBankList] = useState<BankItem[]>([]);
        // 过滤已关注的银行（基于完整 bankList）
          useEffect(() => {
            // 始终基于完整 bankList 过滤出已关注的
            const followingBanks = bankList.filter(bank => bank.isFollowing);
            setFilteredBankList(followingBanks);
          }, [bankList]);

        // 点击外部关闭下拉框
          useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
              if (openDropdownIndex!== null) {
                const dropdownEl = dropdownRefs.current[openDropdownIndex];
                if (dropdownEl &&!dropdownEl.contains(event.target as Node)) {
                  setOpenDropdownIndex(null);
                }
              }
            };

            document.addEventListener("mousedown", handleClickOutside);
            return () => {
              document.removeEventListener("mousedown", handleClickOutside);
            };
          }, [openDropdownIndex]);
          // 切换下拉框显示/隐藏
            const toggleDropdown = (index: number, e: React.MouseEvent) => {
              e.stopPropagation();
              setOpenDropdownIndex(openDropdownIndex === index? null : index);
            };

            // 选择下拉项（更新关注状态）
            const handleSelectOption = (index: number, isFollowing: boolean, e: React.MouseEvent) => {
              e.stopPropagation();
              setBankList(prev =>
                prev.map((bank, i) =>
                  i === index? {...bank, isFollowing } : bank
                )
              );
              setOpenDropdownIndex(null);
            };


         // 处理银行个性化AI开关状态变化
         const handleEnableAIBankChange = () => {
           const newState =!enablePersonalizedAIBank;
           setEnablePersonalizedAIBank(newState);

           if (!newState) {
             // 若从勾选变为取消勾选，将所有银行的关注状态设为false
             setBankList(prevBanks =>
               prevBanks.map(bank => ({...bank, isFollowing: false }))
             );
           }
         };

         // 发送银行偏好数据到后端
         const sendPreferencesBank = async () => {
           if (!user?.id) return;

           // 转换为后端需要的格式
           const payload = {
             enablePersonalizedAIBank,
             // 提取所有银行的关注状态，使用名称作为键（或根据后端需求调整）
             followedBanks: bankList.reduce((acc, bank) => {
               acc[bank.name] = bank.isFollowing;
               return acc;
             }, {} as Record<string, boolean>)
           };

           try {
             // 使用专用的银行偏好保存API
             await savePreferenceBank({
              userId:user.id,
              data: payload
             });
             console.log("银行偏好数据发送成功:", payload);
           } catch (error) {
             console.error("发送银行偏好数据失败:", error);
           }
         };
        // 组件挂载时获取银行偏好数据
        useEffect(() => {
          if (user?.id) {
            fetchBankPreferences();
          }
        }, [user?.id]);
        useEffect(() => {
                sendPreferencesBank();
              }, [enablePersonalizedAIBank]);

      return (
        <div className={styles.preferContainer}>
              <div className={styles.preferTitle}>
                <div><span className={styles.preferPreferenceSpan}>Preference</span></div>
                <div className={styles.preferManageYourPreferences}><span className={styles.preferManageyourpreferencesSpan}>Manage your preferences.</span></div>
              </div>
              <div className={styles.preferSeparator}>
                <div className={styles.preferLine}></div>
              </div>
              <div className={styles.preferContainer01}>
                <div className={styles.preferContainer02}>
                  <div className={styles.preferContainer03}>
                    <div className={styles.preferLabel}>
                      <div><span className={styles.preferLabel01Span}>Interested banks</span></div>
                    </div>
                    <div className={styles.preferManageYourInterestedBanksAndItWouldHelpPersonalizedYourAi}><span className={styles.preferManageyourinterestedbanksanditwouldhelppersonalizedyouraiSpan}>Manage your interested banks and it would help personalized your AI.</span></div>
                  </div>

                  {/* 保持原有样式的搜索框 */}
                    <div
                      data-state="Default"
                      data-style="New York"
                      className={styles.preferSelect}
                      style={{ position: 'relative' }} // 为搜索结果下拉提供定位参考
                    >
                      <div className={styles.preferSelectInput}>
                        {/* 将原有span替换为input，但保留样式类 */}
                        <div className={styles.preferSelect01}>
                          <input
                            ref={inputRef}
                            type="text"
                            value={searchValue}
                            onChange={handleInputChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            autoComplete="off"
                            className={styles.preferSelect01Span} // 使用原有文本样式类
                            placeholder="Search..."
                          />

                        </div>
                        <div className={styles.preferCaretSort}>
                          <img src="/images/profile/SelectArrow.svg" alt="Right arrow" />
                        </div>
                      </div>

                      {/* 搜索结果下拉框 - 复用BankMenuOption组件 */}

                       <BankMenuOption2
                                       companies={searchResults}
                                       show={showDropdown}
                                       onSelect={handleSelect}
                                       inputRef={inputRef}
                                     />
                  </div>

                  {/* 银行列表（基于完整 bankList，只显示已关注的） */}
                  <div className={styles.preferCard}>
                   <div className={styles.preferContent}>
                    <div className={styles.preferSlotContent}>
                      {filteredBankList.length > 0? (
                        // 显示已关注的银行（或搜索匹配项）
                        filteredBankList.map((bank, index) => {
                          // 从完整 bankList 中找到原始索引（用于下拉框操作）
                          const originalIndex = bankList.findIndex(item =>
                            item.name === bank.name && item.region === bank.region
                          );
                          if (originalIndex === -1) return null; // 防止索引异常

                          return (
                            <div key={originalIndex} className={styles.preferContainer04}>
                              <div data-state="Default" className={styles.preferAvatar}>
                                <div className={styles.preferBackground}></div>
                              </div>
                              <div className={styles.preferContainer05}>
                                <div><span className={styles.preferSofiadavisSpan}>{bank.name}</span></div>
                                <div><span className={styles.preferMexamplecomSpan}>{bank.region}</span></div>
                              </div>
                              <div
                                ref={(el:any) => dropdownRefs.current[originalIndex] = el}
                                data-show-input-search="true"
                                data-state="Default"
                                data-style="New York"
                                className={styles.preferCombobox}
                              >
                                <div
                                  className={styles.preferTrigger}
                                  onClick={(e) => toggleDropdown(originalIndex, e)}
                                >
                                  <div className={styles.preferTrigger2} >
                                      <div>
                                        <span className={styles.preferSelectoptionSpan}>
                                          {bank.isFollowing? "Following" : "Not Following"}
                                        </span>
                                      </div>
                                      <div className={styles.preferChevronDown}>
                                        <img src="/images/profile/ChevronDown.svg" alt="Right arrow" />
                                      </div>
                                  </div>
                                  {openDropdownIndex === originalIndex && (
                                      <div className={styles.preferDropdownMenu}>
                                        <div className={styles.preferSeparator2}>
                                          <div className={styles.preferLine}></div>
                                        </div>
                                        <div
                                          className={styles.preferDropdownItem}
                                          onClick={(e) => handleSelectOption(originalIndex, false, e)}
                                        >
                                          <span className={styles.preferSelectoptionSpan} >Not Following</span>
                                        </div>
                                      </div>
                                  )}

                                </div>



                              </div>
                            </div>
                          );
                        })
                      ) : (
                        // 无已关注银行时显示提示
                        <div className={styles.preferNoData}>
                          <span>Please add interested bank</span>
                        </div>
                      )}
                    </div>
                   </div>
                  </div>

                  <div className={styles.preferContainer17}>
                    <div
                      data-show-label="true"
                      data-state={enablePersonalizedAIBank? "Check" : "Uncheck"}
                      data-style="New York"
                      className={styles.preferCheckbox09}
                      onClick={handleEnableAIBankChange}
                    >
                      {/* 启用AI的复选框样式 */}
                      <div className={enablePersonalizedAIBank? styles.preferBackground01 : styles.preferBackgroundWhite}>
                        <div className={styles.preferCheck}>
                          {enablePersonalizedAIBank && (
                            <img
                              src="/images/profile/Check.svg"
                              alt="Checked"
                            />
                          )}
                        </div>
                      </div>
                      <div>
                        <span className={styles.preferLabel14Span}>
                          Enable personalized your AI.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.preferContainer15}>
                  <div className={styles.preferContainer16}>
                    <div className={styles.preferLabel03}>
                      <div><span className={styles.preferLabel04Span}>Interested topics & products</span></div>
                    </div>
                    <div className={styles.preferSelectYourInterestedTopicsProductsAndItWouldHelpPersonalizedYourAiChatbot}><span className={styles.preferSelectyourinterestedtopicsproductsanditwouldhelppersonalizedyouraichatbotSpan}>Select your interested topics & products and it would help personalized your AI Chatbot.</span></div>
                  </div>
                  <div className={styles.preferFrame111}>
                    {topicCheckboxes.map((item, index) => (
                      <div
                        key={index}
                        className={styles.preferFrame101}
                        onClick={() => handleTopicCheckboxChange(index)}
                      >
                        {/* 根据勾选状态切换背景样式 */}
                        <div className={item.isChecked? styles.preferBackground01 : styles.preferBackgroundWhite}>
                          <div className={styles.preferCheck}>
                            {/* 勾选时显示图标，未勾选时不显示 */}
                            {item.isChecked && (
                              <img
                                src="/images/profile/Check.svg"
                                alt="Checked"
                              />
                            )}
                          </div>
                        </div>

                        <div className={styles.preferFrame99}>
                          <div className={styles.preferLabel05}>
                            <div>
                              <span className={styles.preferThisisatextlabelSpan}>
                                {item.label}
                              </span>
                            </div>
                          </div>
                          <div className={styles.preferDotsHorizontal}></div>
                        </div>
                      </div>
                    ))}

                  </div>
                  <div className={styles.preferContainer17}>
                      <div
                        data-show-label="true"
                        data-state={enablePersonalizedAI? "Check" : "Uncheck"}
                        data-style="New York"
                        className={styles.preferCheckbox09}
                        onClick={handleEnableAIChange}
                      >
                        {/* 启用AI的复选框样式 */}
                        <div className={enablePersonalizedAI? styles.preferBackground01 : styles.preferBackgroundWhite}>
                          <div className={styles.preferCheck}>
                            {enablePersonalizedAI && (
                              <img
                                src="/images/profile/Check.svg"
                                alt="Checked"
                              />
                            )}
                          </div>
                        </div>
                        <div>
                          <span className={styles.preferLabel14Span}>
                            Enable personalized your AI.
                          </span>
                        </div>
                      </div>
                  </div>
                </div>
              </div>
            </div>
      );
    };
    // 新增Notification页面内容组件
    const NotiPage = () => {
    const { user } = useClerk();
    // 各分组的label与后端字段映射（根据实际后端字段调整）
    const bankActivityMap:any = {
      "Business Expansion": "BusinessExpansion",
      "New Product Launch": "NewProductLaunch",
      "Major Financial Events": "MajorFinancialEvents",
      "Marketing Campaigns": "MarketingCampaigns",
      "Key Personnel Changes": "KeyPersonnelChanges"
    };

    const marketTrendMap:any = {
      "Global Market Insights": "GlobalMarketInsights",
      "Fintech Trends": "FintechTrends",
      "Consumer Behavior Insights": "ConsumerBehaviorInsights"
    };

    const financialDataMap:any = {
      "Financial Report Updates": "FinancialReportUpdates",
      "Key Financial Metrics Alerts": "KeyFinancialMetricsAlerts",
      "Valuation Updates": "ValuationUpdates",
      "Fundraising Alerts": "FundraisingAlerts",
      "Investment Opportunities": "InvestmentOpportunities"
    };

    const systemPlatformMap:any = {
      "Platform Updates": "PlatformUpdates",
      "Scheduled Maintenance Notices": "ScheduledMaintenanceNotices",
      "Account Security Alerts": "AccountSecurityAlerts",
      "Subscription Status": "SubscriptionStatus"
    };
    // Bank Activity Notifications 分组的复选框
      const [bankActivityItems, setBankActivityItems] = useState<CheckboxItem[]>([
        { label: "Business Expansion", isChecked: false },
        { label: "New Product Launch", isChecked: false },
        { label: "Major Financial Events", isChecked: false },
        { label: "Marketing Campaigns", isChecked: false },
        { label: "Key Personnel Changes", isChecked: false },
      ]);

      // Market Trend Notifications 分组的复选框
      const [marketTrendItems, setMarketTrendItems] = useState<CheckboxItem[]>([
        { label: "Global Market Insights", isChecked: false },
        { label: "Fintech Trends", isChecked: false },
        { label: "Consumer Behavior Insights", isChecked: false },
      ]);

      // Financial Data Notifications 分组的复选框
      const [financialDataItems, setFinancialDataItems] = useState<CheckboxItem[]>([
        { label: "Financial Report Updates", isChecked: false },
        { label: "Key Financial Metrics Alerts", isChecked: false },
        { label: "Valuation Updates", isChecked: false },
        { label: "Fundraising Alerts", isChecked: false },
        { label: "Investment Opportunities", isChecked: false },
      ]);

      // System & Platform Notifications 分组的复选框
      const [systemPlatformItems, setSystemPlatformItems] = useState<CheckboxItem[]>([
        { label: "Platform Updates", isChecked: false },
        { label: "Scheduled Maintenance Notices", isChecked: false },
        { label: "Account Security Alerts", isChecked: false },
        { label: "Subscription Status", isChecked: false },
      ]);

      const handleCheckboxClick = (
        groupState: CheckboxItem[],
        setGroupState: React.Dispatch<React.SetStateAction<CheckboxItem[]>>,
        index: number
      ) => {
        setGroupState(prev =>
          // 与 handleTopicCheckboxChange 逻辑完全一致
          prev.map((item, i) => {
            // 仅当前索引项创建新对象（修改isChecked）
            if (i === index) {
              return { ...item, isChecked: !item.isChecked };
            }
            // 其他项保持原引用（不重新创建对象）
            return item;
          })
        );
      };
      // 三个通知渠道的开关状态（默认值可根据业务调整）
      const [enableAppNotification, setEnableAppNotification] = useState(false);
      const [emailNotification, setEmailNotification] = useState(false);
      const [smsNotification, setSmsNotification] = useState(false);
      const [isLoading, setIsLoading] = useState(false);
      // 邮箱相关状态
      const [tempEmail, setTempEmail] = useState(''); // 临时存储输入值
      const [notiEmail, setNotiEmail] = useState(''); // 验证通过后的正式值
      const [emailError, setEmailError] = useState('');

      // 短信相关状态
      const [tempSms, setTempSms] = useState(''); // 临时存储输入值
      const [notiSms, setNotiSms] = useState(''); // 验证通过后的正式值
      const [smsError, setSmsError] = useState('');
      const fetchNotificationPreferences = async () => {
        setIsLoading(true);
        try {
          if (!user?.id) return;

          // 调用后端API获取通知偏好数据
          const notificationPreferenceData:any = await getNotificationPreference(user.id);

          // 仅当数据存在时更新状态
          if (notificationPreferenceData && Object.keys(notificationPreferenceData).length > 0) {
            // 更新 Bank Activity Notifications 分组
            setBankActivityItems(prev =>
              prev.map(item => ({
               ...item,
                isChecked: notificationPreferenceData[bankActivityMap[item.label]]?? item.isChecked
              }))
            );

            // 更新 Market Trend Notifications 分组
            setMarketTrendItems(prev =>
              prev.map(item => ({
               ...item,
                isChecked: notificationPreferenceData[marketTrendMap[item.label]]?? item.isChecked
              }))
            );

            // 更新 Financial Data Notifications 分组
            setFinancialDataItems(prev =>
              prev.map(item => ({
               ...item,
                isChecked: notificationPreferenceData[financialDataMap[item.label]]?? item.isChecked
              }))
            );

            // 更新 System & Platform Notifications 分组
            setSystemPlatformItems(prev =>
              prev.map(item => ({
               ...item,
                isChecked: notificationPreferenceData[systemPlatformMap[item.label]]?? item.isChecked
              }))
            );

            // 更新三个独立的通知渠道开关状态
            // 1. 应用内通知开关
            if (notificationPreferenceData.enableAppNotification!== undefined) {
              setEnableAppNotification(notificationPreferenceData.enableAppNotification);
            }

            // 2. 邮件通知开关
            if (notificationPreferenceData.emailNotification!== undefined) {
              setEmailNotification(notificationPreferenceData.emailNotification);
            }

            // 3. 短信通知开关
            if (notificationPreferenceData.smsNotification!== undefined) {
              setSmsNotification(notificationPreferenceData.smsNotification);
            }
            if (notificationPreferenceData.email!== undefined) {
                setNotiEmail(notificationPreferenceData.email);
            }
              // 短信号码
            if (notificationPreferenceData.sms!== undefined) {
                setNotiSms(notificationPreferenceData.sms);
            }
          }
        } catch (error) {
          console.error("Error fetching notification preferences:", error);
        } finally {
          setIsLoading(false);
        }
      };
      // 邮箱失焦验证并更新正式值
      const handleEmailBlur = () => {
        const emails = tempEmail;
        setEmailError('');

        // 验证1：不能为空
        if (!emails.trim()) {
          setEmailError('Please enter email');
          return;
        }

        // 验证2：格式校验（支持多邮箱逗号分隔）
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailList = emails.split(',').map(email => email.trim());
        const invalidEmails = emailList.filter(email =>!emailRegex.test(email));

        if (invalidEmails.length > 0) {
          setEmailError(`Invalid email: ${invalidEmails.join(', ')}`);
        } else {
          // 验证通过，更新正式状态
          setNotiEmail(emails);
        }
      };

      // 短信失焦验证并更新正式值
      const handleSmsBlur = () => {
        const sms = tempSms;
        setSmsError('');

        // 验证1：不能为空
        if (!sms.trim()) {
          setSmsError('Please enter a phone number');
          return;
        }

        // 验证2：仅允许包含数字、+、空格，其他字符视为无效
          const invalidChars = sms.match(/[^\d+ ]/g); // 匹配所有不允许的字符
          if (invalidChars) {
            // 去重并提示无效字符
            const uniqueInvalidChars = [...new Set(invalidChars)];
            setSmsError(`Contains invalid characters`);
            return;
          }

          // 验证3：+号只能出现在开头
          if (sms.indexOf('+') > 0) {
            setSmsError('The + symbol can only be at the beginning');
            return;
          }

        // 验证通过，更新正式状态
        setNotiSms(sms);

      };
      const sendNotification = async () => {
        if (!user?.id) return;

        // 转换各分组复选框为后端需要的格式（使用之前定义的映射关系）
        const bankActivityPayload = bankActivityItems.reduce((acc, item) => {
          acc[bankActivityMap[item.label]] = item.isChecked;
          return acc;
        }, {} as Record<string, boolean>);

        const marketTrendPayload = marketTrendItems.reduce((acc, item) => {
          acc[marketTrendMap[item.label]] = item.isChecked;
          return acc;
        }, {} as Record<string, boolean>);

        const financialDataPayload = financialDataItems.reduce((acc, item) => {
          acc[financialDataMap[item.label]] = item.isChecked;
          return acc;
        }, {} as Record<string, boolean>);

        const systemPlatformPayload = systemPlatformItems.reduce((acc, item) => {
          acc[systemPlatformMap[item.label]] = item.isChecked;
          return acc;
        }, {} as Record<string, boolean>);

        // 构建完整请求体
        const payload = {
          // 三个通知开关状态
          enableAppNotification,
          emailNotification,
          smsNotification,

          // 各分组复选框状态
         ...bankActivityPayload,
         ...marketTrendPayload,
         ...financialDataPayload,
         ...systemPlatformPayload,

          // 邮箱和短信内容（仅在对应开关开启时携带，可选）
          notiEmail,
          notiSms
        };

        try {
          // 调用通知偏好保存API（假设接口为saveNotificationPreference）
          await saveNotificationPreference({
            userId:user.id,
            data: payload
          });
          console.log("通知偏好数据发送成功:", payload);
        } catch (error) {
          console.error("发送通知偏好数据失败:", error);
          console.log(payload);
        }
      };
      // 监听所有相关状态变化，自动发送数据
      useEffect(() => {
        // 防抖处理（可选，避免频繁触发）
        const timer = setTimeout(() => {
          sendNotification();
        }, 500); // 500ms防抖

        return () => clearTimeout(timer);
      }, [
        // 依赖项：三个开关状态
        enableAppNotification,
        emailNotification,
        smsNotification,
        // 依赖项：各分组复选框状态
        bankActivityItems,
        marketTrendItems,
        financialDataItems,
        systemPlatformItems,
        // 依赖项：邮箱和短信内容
        notiEmail,
        notiSms,
        // 用户ID（确保用户已登录）
        user?.id
      ]);
      return (
        <div className={styles.notiContainer}>
              <div className={styles.notiTitle}>
                <div><span className={styles.notiNotificationSpan}>Notification</span></div>
                <div className={styles.notiManagementNotificationSettings}>
                  <span className={styles.notiManagementnotificationsettingsSpan}>Management notification settings.</span>
                </div>
              </div>
              <div className={styles.notiSeparator}>
                <div className={styles.notiLine}></div>
              </div>
              <div className={styles.notiContainer01}>
                <div className={styles.notiContainer02}>
                  <div className={styles.notiContainer03}>
                    <div className={styles.notiLabel}>
                      <div><span className={styles.notiLabel01Span}>Notifications content</span></div>
                    </div>
                    <div className={styles.notiManageTheContentOfYourNotifications}>
                      <span className={styles.notiManagethecontentofyournotificationsSpan}>Manage the content of your notifications.</span>
                    </div>
                  </div>
                  <div className={styles.notiCard}>
                    <div className={styles.notiContent}>
                      <div className={styles.notiContainer04}>
                        <div className={styles.notiContainer05}>
                          <div className={styles.notiLabel02}>
                            <div><span className={styles.notiLabel03Span}>Bank Activity Notifications</span></div>
                          </div>
                          <div className={styles.notiKeepTrackOfTheLatestDevelopmentsInYourParticularBankToAvoidMissingOutOnImportantUpdates}>
                            <span className={styles.notiKeeptrackofthelatestdevelopmentsinyourparticularbanktoavoidmissingoutonimportantupdatesSpan}>
                              Keep track of the latest developments in your particular bank to avoid missing out on important updates.
                            </span>
                          </div>
                        </div>
                        <div className={styles.notiContainer06}>
                          {bankActivityItems.map((item, index) => (
                            <div
                              key={item.label}
                              className={styles.notiCheckbox01}
                              onClick={() => handleCheckboxClick(bankActivityItems, setBankActivityItems, index)}
                            >
                              <div className={item.isChecked? styles.notiBackground : styles.notiCheckbox}>
                                  <div className={styles.notiCheck}>
                                    {/* 勾选时显示图标，未勾选时不显示 */}
                                    {item.isChecked && (
                                      <img
                                        src="/images/profile/Check.svg"
                                        alt="Checked"
                                      />
                                    )}
                                  </div>
                              </div>
                              <div className={styles.notiLabel04Span}>{item.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className={styles.notiContainer04}>
                        <div className={styles.notiContainer03}>
                          <div className={styles.notiLabel02}>
                            <div><span className={styles.notiLabel03Span}>Market Trend Notifications</span></div>
                          </div>
                          <div className={styles.notiUnderstandTheOverallDynamicsOfTheNewBankingIndustry}>
                            <span className={styles.notiUnderstandtheoveralldynamicsofthenewbankingindustrySpan}>
                              Understand the overall dynamics of the new banking industry.
                            </span>
                          </div>
                        </div>
                        <div className={styles.notiContainer06}>
                          {marketTrendItems.map((item, index) => (
                            <div
                              key={item.label} // 用label作为唯一key（更稳定）
                              className={styles.notiCheckbox01}
                              onClick={() => handleCheckboxClick(marketTrendItems, setMarketTrendItems, index)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className={item.isChecked? styles.notiBackground : styles.notiCheckbox}>
                                <div className={styles.notiCheck}>
                                  {/* 勾选时显示图标 */}
                                  {item.isChecked && (
                                    <img
                                      src="/images/profile/Check.svg"
                                      alt="Checked"

                                    />
                                  )}
                                </div>
                              </div>
                              <div className={styles.notiLabel04Span}>{item.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className={styles.notiContainer04}>
                        <div className={styles.notiContainer03}>
                          <div className={styles.notiLabel02}>
                            <div><span className={styles.notiLabel03Span}>Financial Data Notifications</span></div>
                          </div>
                          <div className={styles.notiTimelyUnderstandingOfChangesInTheBanksFinancialPositionToSupportInvestmentDecisions}>
                            <span className={styles.notiTimelyunderstandingofchangesinthebanksfinancialpositiontosupportinvestmentdecisionsSpan}>
                              Timely understanding of changes in the bank's financial position to support investment decisions.
                            </span>
                          </div>
                        </div>
                        <div className={styles.notiContainer06}>
                          {financialDataItems.map((item, index) => (
                            <div
                              key={item.label}
                              className={styles.notiCheckbox01}
                              onClick={() => handleCheckboxClick(financialDataItems, setFinancialDataItems, index)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className={item.isChecked? styles.notiBackground : styles.notiCheckbox}>
                                <div className={styles.notiCheck}>
                                  {item.isChecked && (
                                    <img
                                      src="/images/profile/Check.svg"
                                      alt="Checked"
                                    />
                                  )}
                                </div>
                              </div>
                              <div className={styles.notiLabel04Span}>{item.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className={styles.notiLine01}></div>
                      <div className={styles.notiContainer04}>
                        <div className={styles.notiContainer03}>
                          <div className={styles.notiLabel02}>
                            <div><span className={styles.notiLabel03Span}>System & Platform Notifications</span></div>
                          </div>
                          <div className={styles.notiNotificationsOfPlatformUpdatesPlatformMaintenanceAccountChangesAndSubscriptionStatusChanges}>
                            <span className={styles.notiNotificationsofplatformupdatesplatformmaintenanceaccountchangesandsubscriptionstatuschangesSpan}>
                              Notifications of platform updates, platform maintenance, account changes and subscription status changes.
                            </span>
                          </div>
                        </div>
                        <div className={styles.notiContainer06}>
                          {systemPlatformItems.map((item, index) => (
                            <div
                              key={item.label}
                              className={styles.notiCheckbox01}
                              onClick={() => handleCheckboxClick(systemPlatformItems, setSystemPlatformItems, index)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className={item.isChecked? styles.notiBackground : styles.notiCheckbox}>
                                <div className={styles.notiCheck}>
                                  {item.isChecked && (
                                    <img
                                      src="/images/profile/Check.svg"
                                      alt="Checked"
                                    />
                                  )}
                                </div>
                              </div>
                              <div className={styles.notiLabel04Span}>{item.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.notiContainer04}>
                  <div className={styles.notiContainer03}>
                    <div className={styles.notiLabel02}>
                      <div><span className={styles.notiLabel28Span}>Notification Delivery Methods</span></div>
                    </div>
                    <div className={styles.notiManageTheWayNotificationsArePushed}>
                      <span className={styles.notiManagethewaynotificationsarepushedSpan}>Manage the way notifications are pushed.</span>
                    </div>
                  </div>
                  <div className={styles.notiCard}>
                    <div className={styles.notiContent01}>
                      <div className={styles.notiExampleSlotCookieSettingsContent}>
                        <div className={styles.notiContainer18}>
                          <div className={styles.notiComputerDesktopoutline}>
                            <img src="/images/profile/computer.svg" alt="computer"  />
                          </div>
                          <div className={styles.notiContainer19}>
                            <div><span className={styles.notiInAppnotificationsSpan}>In-app Notifications</span></div>
                            <div className={styles.notiPopesite}>
                              <span className={styles.notiPopesiteSpan}>
                                Push notifications are sent via a pop-up window on the site.
                              </span>
                            </div>
                          </div>
                          <div data-status="Checked" data-style="New York"
                            className={enableAppNotification? styles.notiSwitch : styles.notiSwitch01}
                            onClick={() => setEnableAppNotification(!enableAppNotification)}>
                            <div className={enableAppNotification? styles.notiChecker : styles.notiChecker01}></div>
                          </div>
                        </div>
                        <div className={styles.notiFrame1413}>
                          <div className={styles.notiContainer20}>
                            <div className={styles.notiEnvelopeoutline}>
                              <img src="/images/profile/email.svg" alt="email"  />
                            </div>
                            <div className={styles.notiContainer19}>
                              <div><span className={styles.notiInAppnotificationsSpan}>Email Notifications</span></div>
                              <div className={styles.notiPopesite}>
                                <span className={styles.notiPopesiteSpan}>
                                  Type or paste in emails below, separated by commas.
                                </span>
                              </div>
                            </div>
                            <div data-status="Uncheck" data-style="New York"
                            className={emailNotification? styles.notiSwitch : styles.notiSwitch01}
                            onClick={() => setEmailNotification(!emailNotification)} >
                              <div className={emailNotification? styles.notiChecker : styles.notiChecker01}></div>
                            </div>
                          </div>
                          <div className={styles.notiContainer20}>
                            <div className={styles.notiDevicePhoneMobileoutline}>
                              <div className={styles.notiVector10}></div>
                            </div>
                            <div data-state="Default" data-style="New York" data-type="Text" className={styles.notiInput}>
                              <input

                                value={tempEmail}
                                onChange={(e) => {
                                  setTempEmail(e.target.value);
                                  // 输入时清空错误提示
                                  if (emailError) setEmailError('');
                                }}
                                onBlur={handleEmailBlur} // 绑定失焦处理函数
                                placeholder="Your emails..."
                                className={styles.notiPlaceholderSpan}
                              />
                              {/* 错误提示 */}
                                    {emailError && (
                                      <div style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px',paddingLeft: '60px'    }}>
                                        {emailError}
                                      </div>
                              )}

                            </div>
                          </div>
                        </div>
                        <div className={styles.notiFrame1412}>
                          <div className={styles.notiContainer20}>
                            <div className={styles.notiDevicePhoneMobileoutline}>

                              <img src="/images/profile/phone.svg" alt="phone"  />
                            </div>
                            <div className={styles.notiContainer24}>
                              <div><span className={styles.notiInAppnotificationsSpan}>SMS Notifications</span></div>
                              <div className={styles.notiPopesite}>
                                <span className={styles.notiPopesiteSpan}>
                                  Type or paste in phone numbers below, separated by commas.
                                </span>
                              </div>
                            </div>
                            <div data-status="Uncheck" data-style="New York"
                            className={smsNotification? styles.notiSwitch : styles.notiSwitch01}
                            onClick={() => setSmsNotification(!smsNotification)}>
                              <div className={smsNotification? styles.notiChecker : styles.notiChecker01}></div>
                            </div>
                          </div>
                          <div className={styles.notiContainer20}>
                            <div className={styles.notiDevicePhoneMobileoutline}>
                              <div className={styles.notiVector10}></div>

                            </div>
                            <div data-state="Default" data-style="New York" data-type="Text" className={styles.notiInput}>
                              <input
                                  value={tempSms}
                                  onChange={(e) => {
                                    setTempSms(e.target.value);
                                    // 输入时清空错误提示
                                    if (smsError) setSmsError('');
                                  }}
                                  onBlur={handleSmsBlur} // 绑定失焦处理函数
                                  placeholder="Your phone numbers..."
                                  className={styles.notiPlaceholderSpan}
                                />
                                {/* 错误提示 */}
                                      {smsError && (
                                        <div style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px',paddingLeft: '60px'    }}>
                                          {smsError}
                                        </div>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
      );
    };

    // 新增Profile页面内容组件
    const SubPage = () => {
       const { user } = useClerk();
       const router = useRouter();
       const [isExpanded, setIsExpanded] = useState(false);

        const limitedFeatures = (
                <span className={styles.subLimitedaiaccesslimitedlimitedSpan}>
                    • Limited AI access<br />
                    • Limited...<br />
                    • Limited...<br />
                    {!isExpanded && <>...<br /></>}

                </span>
            );

        // 封装 Unlimited 相关的文本内容变量
        const unlimitedFeatures = (
            <span className={styles.subUnlimitedaiaccessunlimitedinformationaisummaryunlimitedunlimitedunlimitedSpan}>
                • Unlimited AI access<br />
                • Unlimited information AI summary<br />
                • Unlimited...<br />
                • Unlimited...<br />
                • Unlimited...<br />
                {!isExpanded && <>...<br /></>}
                • Unlimited...<br />
                • Unlimited...<br />
                • Unlimited...<br />
                • Unlimited...<br />
                • Unlimited...<br />
                • Unlimited...<br />



            </span>
        );
        const enterpriseDes = "For teams needing AI-powered insights and summary."

        // 定义存储订阅数据的状态
          const [subscription, setSubscription]:any = useState(null);
          // 加载状态管理
          const [isLoading, setIsLoading] = useState(false);

          // 从后端获取订阅数据
          const fetchAccount = async () => {
            // 若用户未登录，直接返回
            if (!user?.id) return;

            setIsLoading(true);
            try {
              // 调用获取订阅数据的API，传入用户ID
              const subscriptionData:any = await getAccount(user.id);

              // 仅当数据存在时更新状态
              if (subscriptionData && Object.keys(subscriptionData).length > 0) {
                setSubscription(subscriptionData);
                // 可根据需要处理特定字段，例如：
                // setIsEnterprise(subscriptionData.planType === 'enterprise');
              }
            } catch (error) {
              console.error("Error fetching subscription data:", error);
              // 可选：设置错误状态提示用户
              // setError("Failed to load subscription information");
            } finally {
              setIsLoading(false);
            }
          };

          // 组件挂载且用户ID存在时获取数据
          useEffect(() => {
            fetchAccount();
          }, [user?.id]); // 依赖用户ID，当用户切换时重新获取
          // 动态内容
          // 判断是否为企业版：如果 subscription 存在且 isEnterprise 有值（非空），则为 true，否则为 false
          const isEnterprise:any = subscription?.isEnterprise!== undefined && subscription.isEnterprise!== null;

          // 根据 isEnterprise 动态设置套餐标题和描述
          const planTitle = isEnterprise? 'Enterprise' : 'Free';
          const planDesc = isEnterprise? enterpriseDes : 'For individuals to simply organize banking information.';
          // 切换展开/收起的逻辑
          const toggleExpand = () => {
            setIsExpanded(prev =>!prev);
          };


        // 处理跳转逻辑
        const handlePlanChange = () => {
            router.push('/upgrade-plan');
        };
        const targetUrl = isEnterprise? '/payment' : '/upgrade-plan';
       const collapsedStyle = {
           maxHeight: '125px',
           overflow: 'hidden',
           position:'relative'
         };

         // 展开后样式（显示全部内容）
         const expandedStyle = {
           maxHeight: '1000px', // 足够大的值容纳完整内容
           overflow: 'visible'
         };
         // 存储邮箱列表的状态
         const [userEmails, setUserEmails] = useState([]);
         // 明确命名为邮箱加载状态
         const [isLoadingEmail, setIsLoadingEmail] = useState(false);

         // 预设的mock邮箱数据（兜底用）
         const mockEmails:any = [
           'user1@example.com',
           'user2@example.com',
           'user3@example.com',
           'work@company.com',
         ];

         // 从后端获取邮箱列表
         const fetchEmail = async () => {
           setIsLoadingEmail(true); // 更新为邮箱加载状态
           try {
             // 调用API获取数据（假设需要用户ID）
             const response = await getEmails(user?.id ?? '');
             // 若后端返回有效数据（非空数组），则使用后端数据
             if (response && Array.isArray(response) && response.length > 0) {
              const emailData:any = response
               setUserEmails(emailData);
             } else {
               // 否则使用mock数据
               setUserEmails(mockEmails);
             }
           } catch (error) {
             console.error("Failed to fetch emails:", error);
             // 出错时也使用mock数据兜底
             setUserEmails(mockEmails);
           } finally {
             setIsLoadingEmail(false); // 结束邮箱加载状态
           }
         };

         // 组件挂载时获取数据
         useEffect(() => {
           fetchEmail();
         }, [user?.id]); // 依赖用户ID，用户变化时重新获取

           // 2. 状态管理
           const [isDropdownOpen, setIsDropdownOpen] = useState(false);
           // 默认显示提示文本，选中后更新为邮箱地址
           const [emailDisplay, setEmailDisplay] = useState(
             subscription?.displayEmail?.trim()? subscription.displayEmail : 'Select a verified email to display'
           );

           // 3. 切换下拉列表显示/隐藏
           const toggleDropdown = () => {
              console.log("change toggle");
             setIsDropdownOpen(prev =>!prev);
           };

           // 4. 处理邮箱选中逻辑
          // 在handleSelectEmail中调用保存函数
          const handleSelectEmail = (email: string) => {
            setEmailDisplay(email);
            setIsDropdownOpen(false);
            saveSelectedEmail(email); // 选中后立即保存
          };
          const [isSavingEmail, setIsSavingEmail] = useState(false);
          const [saveEmailError, setSaveEmailError] = useState<string | null>(null);
           const saveSelectedEmail = async (email: string) => {
             setSaveEmailError(null);

             try {
               setIsSavingEmail(true);

               // 调用sendSelectEmail组件，传入必要参数（如用户ID和选中的邮箱）
               const response:any = await sendSelectEmail({
                userId:user?.id ?? '',
                displayEmail: email
               });

               // 假设sendSelectEmail返回成功响应对象
               if (response.success) {
                 console.log('Email saved successfully via sendSelectEmail:', response.data);

                 // 同步更新本地subscription状态
                 if (subscription) {
                   setSubscription((prev:any) => ({...prev, displayEmail: email }));
                 }
               } else {
                 // 处理组件返回的业务错误
                 throw new Error(response.message || 'Failed to save email');
               }

             } catch (error) {
               const errorMessage = error instanceof Error? error.message : 'Unknown error while saving email';
               console.error(errorMessage);
               setSaveEmailError(errorMessage);
             } finally {
               setIsSavingEmail(false);
             }
           };
         // 定义开关状态，true为开启，false为关闭
           const [isChecked, setIsChecked] = useState(true);
           const [isSavingPassword, setIsSavingPassord] = useState(false);
           const [saveError, setSaveError] = useState<string | null>(null);

           // 切换开关状态的处理函数
           const toggleSwitch = () => {
             const newCheckedState =!isChecked; // 先计算最新状态
             console.log(newCheckedState);
             setIsChecked(newCheckedState); // 更新状态
             savePemenantPassword(newCheckedState); // 直接传递最新状态
             console.log("save permanent");
           };
          const savePemenantPassword = async (newCheckedState: boolean) => {
            setSaveError(null);
            setIsSavingPassord(true);

            try {
              // 使用传入的最新状态作为enable的值
              const response:any = await sendPemenantPassword({
                userId:user?.id ?? '',
                enable: isChecked
              });

              if (!response.success) {
                throw new Error(response.message || 'Failed to update password setting');
              }

              console.log('Password setting updated successfully:', response.data);

            } catch (error) {
              const errorMessage = error instanceof Error? error.message : 'Unknown error updating setting';
              console.error(errorMessage);
              setSaveError(errorMessage);

            } finally {
              setIsSavingPassord(false);
            }
          };
         const [twoStep, setTwoStep] = useState(
           subscription?.twoStepNumber
            ? subscription.twoStepNumber
             : 'Enter your phone number'
         );

         // 处理输入框内容变化
         const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
           // 更新变量值为输入框内容
           setTwoStep(e.target.value);
         };
         const handleAddVerification = () => {
           // 调用发送验证的函数
           sendVerification();

         };
         const [verificationError, setVerificationError] = useState<string | null>(null);
         const [verificationSuccess, setVerificationSuccess] = useState(false);
         const [isSending, setIsSending] = useState(false);

           // 发送两步验证请求（调用sendTwoStep组件）
           const sendVerification = async () => {
             // 清空之前的状态
             setVerificationError(null);
             setVerificationSuccess(false);
             setIsSending(true);

             try {
               // 验证手机号是否有效（简单校验）
               if (!twoStep || twoStep.trim() === 'Enter your phone number (+852)12345678') {
                 throw new Error('Please enter a valid phone number');
               }

               // 调用sendTwoStep组件，传递必要参数
               const response:any = await sendTwoStep( {
                userId: user?.id ?? '',
                phoneNumber:twoStep
               });

               // 处理组件返回的响应（根据实际组件格式调整）
               if (!response.success) {
                 throw new Error(response.message || 'Failed to send verification code');
               }

               // 发送成功
               console.log('Verification code sent successfully:', response.data);
               setVerificationSuccess(true);

               // 可选：显示倒计时或验证码输入框
               // setShowCodeInput(true);

             } catch (error) {
               // 捕获并处理错误
               const errorMessage = error instanceof Error? error.message : 'Unknown error sending verification';
               console.error(errorMessage);
               setVerificationError(errorMessage);
             } finally {
               setIsSending(false);
             }
           };
      return (
        <div className={styles.subContainer}>
              <div className={styles.subTitle}>
                <div><span className={styles.subMysubscriptionsSpan}>My Subscriptions</span></div>
                <div className={styles.subManageYourSubscriptionsAndYourAccount}>
                  <span className={styles.subManageyoursubscriptionsandyouraccountSpan}>Manage your subscriptions and your account.</span>
                </div>
              </div>
              <div className={styles.subSeparator}>
                <div className={styles.subLine}></div>
              </div>
              <div className={styles.subContainer01}>
                <div className={styles.subFormField}>
                  <div className={styles.subLabel}>
                    <div><span className={styles.subLabel01Span}>Active plan</span></div>
                  </div>
                  <div data-show-content="true" data-show-desciption="true" data-show-footer="true" data-style="Default" data-type="Content Only" className={styles.subCard}>
                    <div className={styles.subContent}>
                      <div className={styles.subExampleSlotStarContent}>
                        <div className={styles.subContainer02}>
                          <div className={styles.subContainer03}>
                            <div><span className={styles.subShadcnuiSpan}>{planTitle}</span></div>
                            <div className={styles.subBeautifullyDesignedComponentsBuiltWithRadixuiAndTailwindcss}>
                              <span className={styles.subBeautifullydesignedcomponentsbuiltwithradixuiandtailwindcssSpan}>
                                 {planDesc}
                              </span>
                            </div>
                          </div>
                          <div className={styles.subContainer04}>

                            <a
                                href={targetUrl}
                                target="_blank" // 关键：在新标签页打开
                                rel="noopener noreferrer" // 安全配置，防止window.opener漏洞
                                data-show-label="true"
                                data-show-leading-icon="false"
                                data-show-trailing-icon="false"
                                data-size="Default"
                                data-state="Default"
                                data-style="New York"
                                data-variant="Secondary"
                                className={styles.subButton}
                                style={{ cursor: 'pointer', textDecoration: 'none' }}
                            >
                                <div><span className={styles.subButton01Span}>Change plan</span></div>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.subFormField01}>
                  <div className={styles.subLabel02}>
                    <div><span className={styles.subLabel03Span}>All plans</span></div>
                  </div>
                  <div className={styles.subCard01}>
                    <div className={styles.subContent01}>
                      <div className={styles.subExampleSlotStarContent01}>
                        <div className={styles.subContainer05}>
                          <div className={styles.subContainer06}></div>
                          <div className={styles.subContainer07}>
                            <div><span className={styles.subShadcnui01Span}>Free</span></div>
                            <div className={styles.subText0PerMemberMonth}>
                              <span className={styles.subFpermembermonthSpan}>$0 per member / month</span>
                            </div>
                          </div>
                          <div className={styles.subContainer08}>
                            <div><span className={styles.subEnterpriseSpan}>Enterprise</span></div>
                            <div className={styles.subText10PerMemberMonth}>
                              <span className={styles.subF0permembermonthSpan}>$10 per member / month</span>
                            </div>
                            <div data-show-label="true" data-show-leading-icon="false" data-show-trailing-icon="false" data-size="Default" data-state="Default" data-style="New York" data-variant="Secondary" className={styles.subButton02}>
                              <a
                                                              href={targetUrl}
                                                              target="_blank" // 关键：在新标签页打开
                                                              rel="noopener noreferrer" // 安全配置，防止window.opener漏洞
                                                              data-show-label="true"
                                                              data-show-leading-icon="false"
                                                              data-show-trailing-icon="false"
                                                              data-size="Default"
                                                              data-state="Default"
                                                              data-style="New York"
                                                              data-variant="Secondary"
                                                              className={styles.subButton02}
                                                              style={{ cursor: 'pointer', textDecoration: 'none' }}
                                                          >

                                                              <div><span className={styles.subButton03Span}>Upgrade</span></div>
                                                          </a>

                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={styles.subContent02}>
                      <div className={styles.subExampleSlotStarContent02}>
                        <div className={styles.subContainer09}>
                          <div className={styles.subContainer10}>
                            <div className={styles.subHighlights}>
                              <span className={styles.subHighlightsSpan}>Highlights</span>
                            </div>
                          </div>
                          <div className={styles.subContainer11}>
                            <div className={styles.subLimitedAiAccessLimitedLimited} style={isExpanded? expandedStyle : collapsedStyle}>
                              <span className={styles.subLimitedaiaccesslimitedlimitedSpan}>
                                {limitedFeatures}
                              </span>
                            </div>
                          </div>
                          <div className={styles.subContainer12} >
                            <div className={styles.subUnlimitedAiAccessUnlimitedInformationAiSummaryUnlimitedUnlimitedUnlimited} style={isExpanded? expandedStyle : collapsedStyle}>
                              <span className={styles.subUnlimitedaiaccessunlimitedinformationaisummaryunlimitedunlimitedunlimitedSpan}>
                                {unlimitedFeatures}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={styles.subContent03}>
                      <div className={styles.subFrame1410} onClick={toggleExpand}>
                        <div><span className={styles.subCompareallfeaturesSpan}>Compare all features</span></div>
                        <div className={styles.subArrowLongDownoutline}>

                          <img src="/images/profile/longDown.svg" alt="phone" className={styles.subArrowLongDownoutline}  />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.subFormField02}>
                  <div className={styles.subLabel04}>
                    <div><span className={styles.subLabel05Span}>Email & Password</span></div>
                  </div>
                  <div data-state="Default" data-style="New York" className={styles.subSelect}>
                    <div className={styles.subSelectInput} onClick={toggleDropdown}>
                      <div className={styles.subSelect01}>
                        <span className={styles.subSelect01Span}>{emailDisplay}</span>
                      </div>
                      <div className={styles.subCaretSort}>

                         <img src="/images/profile/SelectArrow.svg" alt="phone" className={styles.subCaretSort}  />
                      </div>
                      {/* 下拉列表（状态为true时显示） */}
                            {isDropdownOpen && (
                              <div className={styles.subDropdownList}>
                                {userEmails.map((email, index) => (
                                  <div
                                    key={index}
                                    className={styles.subDropdownItem}
                                    // 点击时执行选中逻辑（阻止事件冒泡，避免再次触发toggleDropdown）
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectEmail(email);
                                    }}
                                  >
                                    {email}
                                    {/* 显示当前选中的邮箱对应的选中状态标识 */}
                                    {email === emailDisplay && (
                                      <span className={styles.subCheckMark}>✓</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                    </div>
                  </div>
                  <div className={styles.subYouCanManageVerifiedEmailAddressesInYourEmailSettings}>
                    <span className={styles.subYoucanmanageverifiedemailaddressesinyouremailsettingsSpan}>
                      You can manage verified email addresses in your email settings.
                    </span>
                  </div>
                  <div className={styles.subContainer13}>
                    <div className={styles.subContainer14}>
                      <div className={styles.subPassword}>
                        <span className={styles.subPasswordSpan}>Password</span>
                      </div>
                      <div className={styles.subSetAPermanentPasswordToLoginToYourAccount}>
                        <span className={styles.subSetapermanentpasswordtologintoyouraccountSpan}>
                          Set a permanent password to login to your account.
                        </span>
                      </div>
                    </div>
                    <div
                          // 根据状态动态修改data-status属性（Uncheck/Check）
                          data-status={isChecked? "Check" : "Uncheck"}
                          data-style="New York"
                          className={isChecked? styles.subSwitch : styles.subSwitch01}
                           onClick={toggleSwitch}>

                          {/* 根据状态控制内部元素的class（保持原有class名） */}
                          <div className={isChecked? styles.subChecker : styles.subChecker01}>
                            {/* 这里可以根据需要添加开关内部的图标或其他元素 */}
                          </div>
                        </div>
                  </div>
                </div>
                <div className={styles.subContainer15}>
                  <div className={styles.subLabel06}>
                    <div><span className={styles.subLabel07Span}>2-Step verification</span></div>
                  </div>
                  <div className={styles.subAddAnAdditionalLayerOfSecurityToYourAccountDuringLogin}>
                    <span className={styles.subAddanadditionallayerofsecuritytoyouraccountduringloginSpan}>
                      Add an additional layer of security to your account during login.
                    </span>
                  </div>

                  <div
                    data-state="Filled"
                    data-style="Default"
                    data-type="Text"
                    className={styles.subInput}
                  >
                    <div className={styles.subValue}>
                      {/* 将静态span改为输入框，并绑定twoStep变量 */}
                      <input
                        type="text"
                        className={styles.subValueSpan} // 复用原有样式类名
                        value={twoStep} // 绑定值
                        onChange={handleInputChange} // 绑定变化事件
                        placeholder="Enter phone number" // 可选：添加占位符
                      />
                    </div>
                  </div>
                  <div data-show-label="true" data-show-leading-icon="false" data-show-trailing-icon="false" data-size="Small" data-state="Default" data-style="New York" data-variant="Outline" className={styles.subButton04}>
                    <div><span className={styles.subButton05Span} onClick={handleAddVerification} >Add verification method</span></div>
                  </div>
                </div>
              </div>
            </div>
      );
    };
    const SettingPage = () => {
        // 声明状态管理是否为白色主题
          const [isWhite, setIsWhite] = useState<boolean>(true);
          const [isDarkTheme, setIsDarkTheme] = useState<boolean>(false);
          // 白色主题点击处理
            const handleThemeClickWhite = () => {
              setIsWhite(true);
            };

            // 深色主题点击处理
            const handleThemeClickBlack = () => {
              setIsWhite(false);
            };
            // 点击更新按钮时，才将选择的主题应用到全局
              const handleUpdateSetting = () => {
                // 根据当前选择的isWhite状态，更新实际生效的主题
                setIsDarkTheme(!isWhite);
              };

              // 只有isDarkTheme变化时，才会更新全局样式
              useEffect(() => {
                if (isDarkTheme) {
                  document.body.classList.add('dark-theme');
                } else {
                  document.body.classList.remove('dark-theme');
                }
                // 可选：持久化主题设置
                localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
              }, [isDarkTheme]);
          return (
            <div className={styles.themeContainer}>
                  <div className={styles.themeTitle}>
                    <div><span className={styles.themeSettingSpan}>Setting</span></div>
                    <div className={styles.themeManagingOtherSystemSettings}>
                      <span className={styles.themeManagingothersystemsettingsSpan}>Managing other system settings.</span>
                    </div>
                  </div>
                  <div className={styles.themeSeparator}>
                    <div className={styles.themeLine}></div>
                  </div>
                  <div className={styles.themeContainer01}>
                    <div className={styles.themeContainer02}>
                      <div className={styles.themeLabel}>
                        <div><span className={styles.themeLabel01Span}>Theme</span></div>
                      </div>
                      <div><span className={styles.themeSelectthethemeforthedashboardSpan}>Select the theme for the dashboard.</span></div>
                      <div className={styles.themeRadioGroup}>
                        <div className={isWhite ? styles.themeRadioGroupItem : styles.themeRadioGroupItem01}
                                       onClick={handleThemeClickWhite} >
                          <div className={styles.themeContainer03}>
                            <div className={styles.themeContainer04}>
                              <div data-shape="Line" data-style="Default" className={styles.themeSkeleton}>
                                <div className={styles.themeSkeleton01}></div>
                              </div>
                              <div data-shape="Line" data-style="Default" className={styles.themeSkeleton02}>
                                <div className={styles.themeSkeleton03}></div>
                              </div>
                            </div>
                            <div className={styles.themeContainer05}>
                              <div data-shape="Circle" data-style="Default" className={styles.themeSkeleton04}>
                                <div className={styles.themeSkeleton05}></div>
                              </div>
                              <div data-shape="Line" data-style="Default" className={styles.themeSkeleton06}>
                                <div className={styles.themeSkeleton07}></div>
                              </div>
                            </div>
                            <div className={styles.themeContainer06}>
                              <div data-shape="Circle" data-style="Default" className={styles.themeSkeleton08}>
                                <div className={styles.themeSkeleton09}></div>
                              </div>
                              <div data-shape="Line" data-style="Default" className={styles.themeSkeleton10}>
                                <div className={styles.themeSkeleton11}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={!isWhite ? styles.themeRadioGroupItem : styles.themeRadioGroupItem01}
                                       onClick={handleThemeClickBlack}>
                          <div className={styles.themeContainer07}>
                            <div className={styles.themeContainer08}>
                              <div data-shape="Line" data-style="Default" className={styles.themeSkeleton12}>
                                <div className={styles.themeSkeleton13}></div>
                              </div>
                              <div data-shape="Line" data-style="Default" className={styles.themeSkeleton14}>
                                <div className={styles.themeSkeleton15}></div>
                              </div>
                            </div>
                            <div className={styles.themeContainer09}>
                              <div data-shape="Circle" data-style="Default" className={styles.themeSkeleton16}>
                                <div className={styles.themeSkeleton17}></div>
                              </div>
                              <div data-shape="Line" data-style="Default" className={styles.themeSkeleton18}>
                                <div className={styles.themeSkeleton19}></div>
                              </div>
                            </div>
                            <div className={styles.themeContainer10}>
                              <div data-shape="Circle" data-style="Default" className={styles.themeSkeleton20}>
                                <div className={styles.themeSkeleton21}></div>
                              </div>
                              <div data-shape="Line" data-style="Default" className={styles.themeSkeleton22}>
                                <div className={styles.themeSkeleton23}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div data-show-label="true" data-show-leading-icon="false" data-show-trailing-icon="false" data-size="Default" data-state="Default" data-style="New York" data-variant="Primary" className={styles.themeButton} onClick={handleUpdateSetting}>
                      <div><span className={styles.themeButton01Span}>Update setting</span></div>
                    </div>
                  </div>
                </div>
          );
        };

  return (
    <>
      {/* 新增 UserButton 组件 */}
      <div className={styles.userButtonContainer}> {/* 可自定义样式 */}
              <UserButton >
                {/* 自定义页面：Preference Page */}
                <UserButton.UserProfilePage
                  label="My Subscription"
                  url="subscription"
                  labelIcon={<DotIcon />}
                >
                  <SubPage />
                </UserButton.UserProfilePage>
                {/* 自定义页面：Preference Page */}
                <UserButton.UserProfilePage
                  label="Preference"
                  url="preference"
                  labelIcon={<DotIcon />}
                >
                  <PreferencePage />
                </UserButton.UserProfilePage>
                {/* 自定义页面：Invite Page */}
                <UserButton.UserProfilePage
                  label="Invite user"
                  url="invite"
                  labelIcon={<DotIcon />}
                >
                  <InvitePage />
                </UserButton.UserProfilePage>
                {/* 自定义页面：Invite Page */}
                <UserButton.UserProfilePage
                  label="Notification"
                  url="notification"
                  labelIcon={<DotIcon />}
                >
                  <NotiPage />
                </UserButton.UserProfilePage>
                {/* 自定义页面：Setting Page */}
                <UserButton.UserProfilePage
                  label="Setting"
                  url="setting"
                  labelIcon={<DotIcon />}
                >
                  <SettingPage />
                </UserButton.UserProfilePage>

              </UserButton>
      </div>
      <div> this is profile </div>




    </>
  );
};

export default Profile;