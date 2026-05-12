import { apiClient } from "../apiClient";

// 注册的邮箱，需检测有效性
export const postAccountValidateEmail = async (email: string) => {
  try {
    const response = await apiClient({
      url: '/account/validate-email',
      options: {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({email: email})
      },
      requireAuth: false,
      useCache: false // 启用缓存
    });
    return response;
  } catch (error) {
    console.error('Error Validate Email:', error);
    throw error;
  }
}

// 发送邮箱验证码
export const postAccountVerificationCode = async ({
  email,
  type
} : {
  email: string,
  type: number
 }) => {
  try {
    const response = await apiClient({
      url: '/account/verificationCode',
      options: {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({email: email, type: type})
      },
      requireAuth: false,
      useCache: false // 启用缓存
    });
    return response;
  } catch (error) {
    console.error('Error Verification Code:', error);
    throw error;
  }
}

// 注册
export const postAccountRegister = async ({
  email,
  passWord,
  confirmPassword,
  verificationCode
} : {
  email: string,
  passWord: string,
  confirmPassword: string,
  verificationCode: string,
 }) => {
  try {
    const requestBody = {
        email: email,
        passWord: passWord,
        confirmPassword: confirmPassword,
        verificationCode: verificationCode
    }
    const response = await apiClient({
      url: '/account/register',
      options: {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody)
      },
      requireAuth: false,
      useCache: false // 启用缓存
    });
    return response;
  } catch (error) {
    console.error('Error Account Register:', error);
    throw error;
  }
}

// 登录
export const postLoginToken = async ({
  email,
  passWord,
} : {
  email: string,
  passWord: string,
 }) => {
  try {
    const requestBody = {
        email: email,
        passWord: passWord,
    }
    const response = await apiClient({
      url: '/account/login-token',
      options: {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody)
      },
      requireAuth: false,
      useCache: false // 启用缓存
    });
    return response;
  } catch (error) {
    console.error('Error Login Token:', error);
    throw error;
  }
}
// 密码修改
export const postResetPassword = async ({
  email,
  passWord,
  newPassword,
  verificationCode
} : {
  email: string,
  passWord: string,
  newPassword: string,
  verificationCode: string,
 }) => {
  try {
    const requestBody = {
        email: email,
        confirmPassword:passWord,
        newPassword: newPassword,
        verificationCode: verificationCode
    }
    const response = await apiClient({
      url: '/account/reset-password',
      options: {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody)
      },
      requireAuth: false,
      useCache: false // 启用缓存
    });
    return response;
  } catch (error) {
    console.error('Error Reset Password :', error);
    throw error;
  }
}

// 登出
export const postAccountLogout = async () => {
  try {
    const response = await apiClient({
      url: '/account/logout',
      options: {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
      },
      requireAuth: true,
      token: localStorage.getItem('token'),
      useCache: false // 启用缓存
    });
    return response;
  } catch (error) {
    console.error('Error fetching news link:', error);
    throw error;
  }
}

// 刷新token
export const postRefreshToken = async () => {
  try {
    const response = await apiClient({
      url: '/account/refresh-token',
      options: {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({refreshToken: localStorage.getItem('refreshToken'), accessToken: localStorage.getItem('token')})
      },
      requireAuth: true,
      token: localStorage.getItem('token'),
      useCache: false // 启用缓存
    });
    return response;
  } catch (error) {
    console.error('Error fetching news link:', error);
    throw error;
  }
}
// 简单的token刷新管理器
let refreshTimer: NodeJS.Timeout | null = null;

// 启动token刷新
export const startTokenRefresh = () => {
  // 清除现有定时器
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }

  // 每15分钟刷新一次
  refreshTimer = setInterval(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await postRefreshToken();
        if (response && response.accessToken) {
          localStorage.setItem('token', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
          console.log('Token刷新成功');
        }
      } catch (error) {
        console.error('Token刷新失败:', error);
      }
    }
  }, 15*60 *1000);
};

// 停止token刷新
export const stopTokenRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

// 登录成功后调用
export const onLoginSuccess = (token: string) => {
  localStorage.setItem('token', token);
  startTokenRefresh();
};

// 登出时调用
export const onLogout = () => {
  stopTokenRefresh();
  localStorage.removeItem('token');
};
// 获取用户关注银行
export const getPreferenceUserIdBanks = async (userId: string | null) => {
  try {
    const params = new URLSearchParams();
    let userIdStr:any = userId ? userId : localStorage.getItem('userId')
    params.append('userId', userIdStr);
    const response = await apiClient({
      url: `/profile/preference/banks`,
      options: {
        method: 'POST',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params
      },
      requireAuth: true,
      token:  localStorage.getItem('token'),
      useCache: false // 启用缓存
    });
    return response;
  } catch (error) {
    console.error('Error fetching news link:', error);
    throw error;
  }
}

// 新增或取消关注银行，bankdetail页面增加关注图标
export const getPreferenceUserIdBanksUpdate = async (params: any) => {
  try {
    const urlParams = new URLSearchParams();
    let userIdStr:any = params.userId ? params.userId : localStorage.getItem('userId')
    let enablePersonalizedAIBankBool:any = params.enablePersonalizedAIBank ? params.enablePersonalizedAIBank : false
    let followedBanksArray:any = params.followedBanks ? params.followedBanks : []
    urlParams.append('userId', userIdStr);
    urlParams.append('enablePersonalizedAIBank', enablePersonalizedAIBankBool);
    urlParams.append('followedBanks', followedBanksArray);
    const response = await apiClient({
      url: `/profile/preference/banks/update`,
      options: {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params)
      },
      requireAuth: true,
      token:  localStorage.getItem('token'),
      useCache: false // 启用缓存
    });
    return response;
  } catch (error) {
    console.error('Error fetching news link:', error);
    throw error;
  }
}
// 邀请邮箱验证校验
export const postProfileInvitationsEmail = async (params: any) => {
  try {
    const response = await apiClient({
      url: '/profile/invitationsEmail',
      options: {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params)
      },
      requireAuth: true,
      token: localStorage.getItem('token'),
      useCache: false // 启用缓存
    });
    return response;
  } catch (error) {
    console.error('Error fetching news link:', error);
    throw error;
  }
}
// 获取用户ID
export const postAccountUserId = async () => {
  try {
    const response = await apiClient({
      url: '/homepage/getAccountUserId',
      options: {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
      },
      requireAuth: true,
      token: localStorage.getItem('token'),
      useCache: false // 启用缓存
    });
    return response;
  } catch (error) {
    console.error('Error fetching news link:', error);
    throw error;
  }
}
// 发送邀请邮件
export const postInvitationsEmail = async (params: {emails: string[]}) => {
  try {
    const response = await apiClient({
      url: '/invitationsEmail',
      options: {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params)
      },
      requireAuth: true,
      token: localStorage.getItem('token'),
      useCache: false // 启用缓存
    });
    return response;
  } catch (error) {
    console.error('Error fetching news link:', error);
    throw error;
  }
}
