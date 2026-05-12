import { FunctionComponent, useCallback } from 'react';
import './UserAccountMenu.css';

export type UserAccountMenuType = {
    className?: string;
    onClose?: () => void;
    isOpen?: Boolean;
}



const UserAccountMenu:FunctionComponent<UserAccountMenuType> = ({ className="", onClose }) => {

    const onContainerClick = useCallback(() => {
        // Add your code here
    }, []);

    return (
        <div className={`user-account-menu ${className}`}>
            <div className="container49">
                <div className="menu-header">
                    <div className="label20">lowanyeung@gmail.com</div>
                </div>
            </div>
            <div className="container50">
                <div className="menu-item13">
                    <div className="container51">
                        <div className="icon-container">
                            <div className="button9">
                                <div className="button10">Change Account</div>
                            </div>
                        </div>
                        <div className="label21" />
                    </div>
                    <div className="container52" />
                </div>
            </div>
            <div className="menu-separator">
                <div className="line" />
            </div>
            <div className="container53" onClick={onContainerClick}>
                <div className="menu-item13">
                    <div className="container51">
                        <div className="icon-container">
                            <img className="user-icon" alt="" src="user.svg" />
                        </div>
                        <div className="label22">Profile</div>
                    </div>
                    <div className="container52" />
                </div>
            </div>
            <div className="container56">
                <div className="menu-item15" onClick={onContainerClick}>
                    <div className="container51">
                        <div className="icon-container">
                            <img className="user-icon" alt="" src="credit-card.svg" />
                        </div>
                        <div className="label22">My Subscriptions</div>
                    </div>
                    <div className="container52" />
                </div>
                <div className="menu-item15" onClick={onContainerClick}>
                    <div className="container51">
                        <div className="icon-container">
                            <img className="user-icon" alt="" src="star/outline.svg" />
                        </div>
                        <div className="label22">Preference</div>
                    </div>
                    <div className="container52" />
                </div>
                <div className="menu-item17" onClick={onContainerClick}>
                    <div className="container51">
                        <div className="icon-container">
                            <img className="user-icon" alt="" src="user-plus.svg" />
                        </div>
                        <div className="label22">Invite users</div>
                    </div>
                    <div className="icon-container">
                        <img className="user-icon" alt="" src="chevron-right.svg" />
                    </div>
                </div>
            </div>
            <div className="menu-separator">
                <div className="line" />
            </div>
            <div className="menu-item15" onClick={onContainerClick}>
                <div className="container51">
                    <div className="icon-container">
                        <img className="user-icon" alt="" src="bell/outline.svg" />
                    </div>
                    <div className="label22">Notification</div>
                </div>
                <div className="container52" />
            </div>
            <div className="menu-separator">
                <div className="line" />
            </div>
            <div className="container56">
                <div className="menu-item15" onClick={onContainerClick}>
                    <div className="container51">
                        <div className="icon-container">
                            <img className="user-icon" alt="" src="settings.svg" />
                        </div>
                        <div className="label22">Settings</div>
                    </div>
                    <div className="container52" />
                </div>
                <div className="menu-item13">
                    <div className="container51">
                        <div className="icon-container">
                            <img className="user-icon" alt="" src="moon/outline.svg" />
                        </div>
                        <div className="label22">Dark Mode</div>
                    </div>
                    <div className="container69">
                        <div className="p13" />
                        <div className="switch">
                            <div className="checker" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="menu-separator">
                <div className="line" />
            </div>
            <div className="container56">
                <div className="menu-item13">
                    <div className="container51">
                        <div className="icon-container">
                            <img className="user-icon" alt="" src="log-out.svg" />
                        </div>
                        <div className="label22">Logout</div>
                    </div>
                    <div className="container52" />
                </div>
            </div>
        </div>);
};

export default UserAccountMenu;
