import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { api, setAuthToken, setCurrentUser } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export const AuthModal = ({ open, onClose, onSuccess }: AuthModalProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await api.auth.login(loginData.email, loginData.password);
      
      if (result.error) {
        toast({
          title: 'Ошибка входа',
          description: result.error,
          variant: 'destructive'
        });
      } else {
        setAuthToken(result.token);
        setCurrentUser(result.user);
        toast({
          title: 'Успешный вход!',
          description: `Добро пожаловать, ${result.user.full_name || result.user.username}!`
        });
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось войти',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await api.auth.register(
        registerData.username,
        registerData.email,
        registerData.password,
        registerData.full_name
      );
      
      if (result.error) {
        toast({
          title: 'Ошибка регистрации',
          description: result.error,
          variant: 'destructive'
        });
      } else {
        setAuthToken(result.token);
        setCurrentUser(result.user);
        toast({
          title: 'Успешная регистрация!',
          description: `Добро пожаловать в Lumi+, ${result.user.full_name}!`
        });
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось зарегистрироваться',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Добро пожаловать в Lumi+
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Вход</TabsTrigger>
            <TabsTrigger value="register">Регистрация</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password">Пароль</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Вход...' : 'Войти'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Или войти через</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" disabled>
                <Icon name="Globe" className="mr-2" size={16} />
                Яндекс
              </Button>
              <Button variant="outline" disabled>
                <Icon name="Globe" className="mr-2" size={16} />
                VK
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-username">Имя пользователя</Label>
                <Input
                  id="register-username"
                  placeholder="username"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-fullname">Полное имя</Label>
                <Input
                  id="register-fullname"
                  placeholder="Ваше Имя"
                  value={registerData.full_name}
                  onChange={(e) => setRegisterData({ ...registerData, full_name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="your@email.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-password">Пароль</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
