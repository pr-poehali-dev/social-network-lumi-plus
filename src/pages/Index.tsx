import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Post = {
  id: number;
  author: {
    name: string;
    avatar: string;
    username: string;
  };
  image: string;
  likes: number;
  comments: number;
  caption: string;
  timestamp: string;
  liked: boolean;
};

type Story = {
  id: number;
  username: string;
  avatar: string;
  viewed: boolean;
};

const Index = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: {
        name: 'Мария Светлова',
        avatar: '/placeholder.svg',
        username: '@maria_sv'
      },
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      likes: 324,
      comments: 47,
      caption: 'Утренний рассвет в горах 🌄 Красота природы вдохновляет каждый день',
      timestamp: '2 часа назад',
      liked: false
    },
    {
      id: 2,
      author: {
        name: 'Алексей Норд',
        avatar: '/placeholder.svg',
        username: '@alex_nord'
      },
      image: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=800&q=80',
      likes: 892,
      comments: 124,
      caption: 'Новый арт-проект готов! Минимализм и геометрия ✨',
      timestamp: '5 часов назад',
      liked: false
    },
    {
      id: 3,
      author: {
        name: 'София Лайт',
        avatar: '/placeholder.svg',
        username: '@sofia_light'
      },
      image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80',
      likes: 567,
      comments: 89,
      caption: 'Закаты на побережье — моя медитация 🌅 #природа #спокойствие',
      timestamp: '1 день назад',
      liked: false
    }
  ]);

  const stories: Story[] = [
    { id: 1, username: 'Твоя история', avatar: '/placeholder.svg', viewed: false },
    { id: 2, username: 'Анна', avatar: '/placeholder.svg', viewed: false },
    { id: 3, username: 'Дмитрий', avatar: '/placeholder.svg', viewed: false },
    { id: 4, username: 'Елена', avatar: '/placeholder.svg', viewed: true },
    { id: 5, username: 'Иван', avatar: '/placeholder.svg', viewed: false },
    { id: 6, username: 'Ксения', avatar: '/placeholder.svg', viewed: true }
  ];

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const ProfileView = () => (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row items-center gap-8 mb-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-primary/10">
        <Avatar className="w-32 h-32 border-4 border-primary/20">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback>МС</AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold mb-2">Мария Светлова</h1>
          <p className="text-muted-foreground mb-4">@maria_sv • Фотограф и путешественник</p>
          <div className="flex gap-6 justify-center md:justify-start mb-4">
            <div>
              <div className="text-2xl font-bold">342</div>
              <div className="text-sm text-muted-foreground">публикаций</div>
            </div>
            <div>
              <div className="text-2xl font-bold">12.5K</div>
              <div className="text-sm text-muted-foreground">подписчиков</div>
            </div>
            <div>
              <div className="text-2xl font-bold">890</div>
              <div className="text-sm text-muted-foreground">подписок</div>
            </div>
          </div>
          <Button className="w-full md:w-auto">Редактировать профиль</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <div 
            key={i} 
            className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 hover:scale-105 transition-transform cursor-pointer"
          >
            <img 
              src={`https://images.unsplash.com/photo-${1500000000000 + i * 10000000}?w=400&q=80`}
              alt={`Post ${i}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Lumi+
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <Icon name="Heart" size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <Icon name="MessageCircle" size={20} />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 bg-white/60 backdrop-blur-sm">
            <TabsTrigger value="feed" className="gap-2">
              <Icon name="Home" size={18} />
              <span className="hidden sm:inline">Лента</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="gap-2">
              <Icon name="Search" size={18} />
              <span className="hidden sm:inline">Поиск</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Icon name="Bell" size={18} />
              <span className="hidden sm:inline">Уведомления</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <Icon name="Mail" size={18} />
              <span className="hidden sm:inline">Сообщения</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <Icon name="User" size={18} />
              <span className="hidden sm:inline">Профиль</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            <div className="flex gap-4 overflow-x-auto pb-4 px-2 -mx-2 scrollbar-hide">
              {stories.map((story) => (
                <button
                  key={story.id}
                  onClick={() => setSelectedStory(story)}
                  className="flex flex-col items-center gap-2 flex-shrink-0 group"
                >
                  <div className={`p-1 rounded-full bg-gradient-to-tr ${story.viewed ? 'from-gray-300 to-gray-400' : 'from-primary via-secondary to-accent'} animate-scale-in`}>
                    <Avatar className="w-16 h-16 border-4 border-background group-hover:scale-105 transition-transform">
                      <AvatarImage src={story.avatar} />
                      <AvatarFallback>{story.username[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-xs max-w-[70px] truncate">{story.username}</span>
                </button>
              ))}
            </div>

            <div className="space-y-6">
              {posts.map((post) => (
                <Card key={post.id} className="overflow-hidden border-border/50 bg-white/80 backdrop-blur-sm animate-fade-in-up hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-3 p-4">
                      <Avatar>
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{post.author.name}</p>
                        <p className="text-sm text-muted-foreground">{post.author.username}</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Icon name="MoreVertical" size={20} />
                      </Button>
                    </div>

                    <div className="relative aspect-square bg-gradient-to-br from-primary/10 to-accent/10">
                      <img 
                        src={post.image} 
                        alt="Post" 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-4">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleLike(post.id)}
                          className={post.liked ? 'text-red-500' : ''}
                        >
                          <Icon name={post.liked ? 'Heart' : 'Heart'} size={24} className={post.liked ? 'fill-current' : ''} />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Icon name="MessageCircle" size={24} />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Icon name="Send" size={24} />
                        </Button>
                        <Button variant="ghost" size="icon" className="ml-auto">
                          <Icon name="Bookmark" size={24} />
                        </Button>
                      </div>

                      <div>
                        <p className="font-semibold mb-1">{post.likes.toLocaleString()} отметок "Нравится"</p>
                        <p className="text-sm">
                          <span className="font-semibold">{post.author.username}</span> {post.caption}
                        </p>
                        <button className="text-sm text-muted-foreground mt-1">
                          Посмотреть все комментарии ({post.comments})
                        </button>
                        <p className="text-xs text-muted-foreground mt-1">{post.timestamp}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="search" className="animate-fade-in">
            <div className="text-center py-20">
              <Icon name="Search" size={64} className="mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Поиск</h2>
              <p className="text-muted-foreground">Находите людей, посты и сообщества</p>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="animate-fade-in">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="p-4 bg-white/80 backdrop-blur-sm hover:bg-primary/5 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>U{i}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">Пользователь {i}</span> оценил ваш пост
                      </p>
                      <p className="text-xs text-muted-foreground">{i} часов назад</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20" />
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="messages" className="animate-fade-in">
            <div className="text-center py-20">
              <Icon name="MessageCircle" size={64} className="mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Сообщения</h2>
              <p className="text-muted-foreground">Ваши беседы появятся здесь</p>
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <ProfileView />
          </TabsContent>
        </Tabs>
      </div>

      {selectedStory && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-fade-in"
          onClick={() => setSelectedStory(null)}
        >
          <div className="max-w-md w-full aspect-[9/16] bg-gradient-to-br from-primary/30 to-accent/30 rounded-xl overflow-hidden relative animate-scale-in">
            <div className="absolute top-4 left-4 right-4 flex items-center gap-3 z-10">
              <Avatar className="border-2 border-white">
                <AvatarImage src={selectedStory.avatar} />
                <AvatarFallback>{selectedStory.username[0]}</AvatarFallback>
              </Avatar>
              <span className="text-white font-semibold">{selectedStory.username}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-auto text-white hover:bg-white/20"
                onClick={() => setSelectedStory(null)}
              >
                <Icon name="X" size={24} />
              </Button>
            </div>
            <div className="w-full h-full flex items-center justify-center text-white text-xl">
              История {selectedStory.username}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
