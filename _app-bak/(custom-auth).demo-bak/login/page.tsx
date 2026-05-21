'use client'
import styles from './../css/layout.module.css';
import Image from 'next/image';
import type { FormProps } from 'antd';
import { Form, Input, Button, message} from 'antd'
import Link from 'next/link';
import { useState, useCallback, useEffect } from 'react';
import { postLoginToken, postAccountUserId } from '@/app/api/login'
import { useRouter } from 'next/navigation';
import { onLoginSuccess } from '@/app/api/login';
import { useIsMainland } from '@/components/utils/region-utils'
import { useTranslations } from 'next-intl';
type FieldType = {
  email?: string;
  passWord?: string;
};

const Login = () => {
  const [form] = Form.useForm();
  const t = useTranslations('Common');
  const router = useRouter();
  const isMainland = useIsMainland();
  const loginAccount = async (values: FieldType) => {
    try {
      if (!values.email || !values.passWord) {
        message.error(t('requiredFields'));
        return;
      }
      const response = await postLoginToken(values as any);
      if(response && response.accessToken){
        localStorage.setItem('token', response.accessToken);
        if(isMainland){
          onLoginSuccess(response.accessToken);
        }
      }
      if(response && response.refreshToken){
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      const userIdResponse = await postAccountUserId();
      if(userIdResponse){
        localStorage.setItem('userId', userIdResponse);
      }
      message.success(t('loginSuccess'));
      router.push('/');
    } catch (error) {
      // message.error(t('loginFailed'));
    }
  };
  const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    console.log('Success:', values);
    loginAccount(values);
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
        <Link href="/register" className={styles.customLoginSignUp}>
          {t('signUp')}
        </Link>
      </div>
      <div className={styles.customLoginTitle}>
        <Image src="/images/login/nIcon.svg" alt="logo" width={50} height={50} />
        <div className={styles.customLoginTitleText}>{t('signIn')}</div>
      </div>
      <div className={styles.customLoginFormContainer}>
        <Form
          name="basic"
          form={form}
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
            rules={[
              { required: true, message: t('emailVerify') },
            ]}
          >
            <Input className={styles.customLoginInput} placeholder={t('emailInput')} />
          </Form.Item>

          <Form.Item<FieldType>
            label={null}
            name="passWord"
            rules={[{ required: true, message: t('passwordVerify') }]}
          >
            <Input.Password className={styles.customLoginInput} placeholder={t('passwordInput')} />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
            <div className={styles.customLoginButton} onClick={handleSubmit}>
              {t('signInWithEmail')}
            </div>
          </Form.Item>
        </Form>
        {/* <Button onClick={() => loginAccount({ email: values.email, passWord: values.passWord })} className={styles.customLoginButton} type="primary" htmlType="submit">
          Sign In with Email
        </Button> */}
      </div>
      <div className={styles.customLoginForgotPassword}>
        <Link href="/resetPassword">
          {t('forgotPassword')}
        </Link>
      </div>
    </div>
  );
};
export default Login;