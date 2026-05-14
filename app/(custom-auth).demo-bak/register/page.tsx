'use client'
import styles from './../css/layout.module.css';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import type { FormProps } from 'antd';
import { Form, Input, Button, message} from 'antd'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { postAccountRegister, postAccountValidateEmail, postAccountVerificationCode } from '@/app/api/login'
import { useTranslations } from 'next-intl';
type FieldType = {
  email?: string;
  passWord?: string;
  confirmPassword?: string;
  verificationCode?: string;
};
// 在文件顶部添加正则表达式
const emailRegex = /^[\w.-]+@([\w-]+\.)+[\w-]{2,}$/;

// 邮箱验证函数
const validateEmailFormat = async (email: string): Promise<boolean> => {
  // 检查邮箱是否为空
  if (!email || !emailRegex.test(email)) {
    return false;
  }
  try {
    // 异步验证邮箱是否存在
    const res = await postAccountValidateEmail(email);
    return !res?.exist;
  } catch (error) {
    console.error("邮箱验证失败:", error);
    return false;
  }
  // return emailRegex.test(email);
};
const SmsCountdownButton = () => {
  const t = useTranslations('Common');
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();
  const form = Form.useFormInstance();
  // 发送验证码
  const sendCode = async () => {
    try {
      const email = form.getFieldValue('email');
      if (!email) {
        message.error(t('emailVerify'));
        return;
      }
      // 验证格式
      if (!emailRegex.test(email)) {
        message.error(t('emailInvalid'));
        return;
      }
      // 1. 调用发送验证码API
      await postAccountVerificationCode({ email, type: 1 });
      // 2. 开始倒计时
      setCountdown(60);
      // 3. 提示用户
      message.success(t('verificationCodeSent'));
    } catch (error) {
      message.error(t('verificationCodeSendFailed'));
    }
  };
  // 倒计时逻辑
  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // 组件卸载时清理
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [countdown]);

  return (
    <Button
      className={styles.customLoginInputRightButton}
      type="primary"
      onClick={sendCode}
      disabled={countdown > 0}
      style={{ minWidth: 100 }}
    >
      {countdown > 0 ? `${countdown}S` : t('verifyEmail')}
    </Button>
  );
};
const register = () => {
  const router = useRouter();
  const t = useTranslations('Common');
  const [form] = Form.useForm();
  // 注册接口
  const registerAccount = async (values: FieldType) => {
    try {
      if (!values.email || !values.passWord || !values.confirmPassword || !values.verificationCode) {
        message.error(t('requiredFields'));
        return;
      }
      await postAccountRegister(values as any);
      message.success(t('registrationSuccess'));
      router.push('/login');
    } catch (error) {
      message.error(t('registrationFailed'));
    }
  };
  const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    console.log('Success:', values);
    registerAccount(values)
  };
  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
   const handleSubmit = () => {
    form.submit();
  };
  return (
    <div className={styles.customLogin}>
      <div className={styles.customLoginSignUpContainer}>
        <Link href="/login" className={styles.customLoginSignUp}>
          {t('signIn')}
        </Link>
      </div>
      <div className={styles.customLoginTitle}>
        <Image src="/images/login/nIcon.svg" alt="logo" width={50} height={50} />
        <div className={styles.customLoginTitleText}>{t('signUp')}</div>
      </div>
      <div className={styles.customLoginFormContainer}>
        <Form
          form={form}
          name="basic"
          labelCol={{ span: 0 }}
          wrapperCol={{ span: 24 }}
          style={{width: '80%'}}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item<FieldType>
            label={null}
            name="email"
            validateTrigger={['onBlur']}
            rules={[
              { required: true, message: t('emailVerify') },
              {
                validator: async (_, value) => {
                  if (!value) {
                    return Promise.resolve();
                  }
                  // 先验证格式
                  if (!emailRegex.test(value)) {
                    return Promise.reject(new Error(t('emailInvalid')));
                  }
                  // 异步验证邮箱是否存在
                  try {
                    const res = await postAccountValidateEmail(value);
                    if (res?.exist) {
                      return Promise.reject(new Error(t('emailRegistered')));
                    }
                    return Promise.resolve();
                  } catch (error) {
                    console.error("邮箱验证失败:", error);
                    return Promise.resolve(); // 验证失败时不阻止用户继续
                  }
                }
              }
            ]}
          >
            <Input className={styles.customLoginInput} placeholder={t('emailInput')} />
          </Form.Item>

          <Form.Item<FieldType>
            label={null}
            name="passWord"
            rules={[
              { required: true, message: t('passwordVerify') },
              { min: 6, message: t('passwordMinLength') }
            ]}
          >
            <Input.Password className={styles.customLoginInput} placeholder={t('passwordInput')} />
          </Form.Item>

          <Form.Item<FieldType>
            label={null}
            name="confirmPassword"
            rules={[
              { required: true, message: t('confirmPasswordVerify') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('passWord') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('passwordNotMatch')));
                },
              }),
            ]}
          >
            <Input.Password className={styles.customLoginInput} placeholder={t('confirmPasswordInput')} />
          </Form.Item>

          <Form.Item<FieldType>
            label={null}
            name="verificationCode"
            rules={[{ required: true, message: t('verificationCodeVerify') }]}
          >
            <div className={styles.customLoginInputContainer}>
              <Input className={`${styles.customLoginInput} ${styles.customLoginInputLeft}`} placeholder={t('verificationCodeVerify')} />
              <div className={styles.customLoginInputRight}>
                <SmsCountdownButton />
              </div>
            </div>
          </Form.Item>
          {/* 将Button移动到Form内部 */}
          <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
            <div className={styles.customLoginButton} onClick={handleSubmit}>
              {t('continue')}
            </div>
          </Form.Item>
        </Form>
        {/* <Button className={styles.customLoginButton} type="primary" htmlType="submit">
          Continue
        </Button> */}
      </div>
      <div className={styles.customLoginForgotPassword}>
        <Link href="/login">{t('back')}</Link>
      </div>
    </div>
  )
}
export default register;