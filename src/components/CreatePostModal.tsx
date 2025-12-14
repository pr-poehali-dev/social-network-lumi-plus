import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

type CreatePostModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export const CreatePostModal = ({ open, onClose, onSuccess }: CreatePostModalProps) => {
  const [loading, setLoading] = useState(false);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach((file) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const base64Data = base64.split(',')[1];
        
        setMediaFiles((prev) => [...prev, {
          data: base64Data,
          type: file.type
        }]);
        
        setPreviewUrls((prev) => [...prev, base64]);
      };
      
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mediaFiles.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Добавьте хотя бы одно фото или видео',
        variant: 'destructive'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const mediaType = mediaFiles[0].type.startsWith('video/') ? 'video' : 'image';
      const result = await api.posts.create(caption, mediaFiles, mediaType, location);
      
      if (result.error) {
        toast({
          title: 'Ошибка',
          description: result.error,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Пост опубликован!',
          description: 'Ваш контент появился в ленте'
        });
        
        setCaption('');
        setLocation('');
        setMediaFiles([]);
        setPreviewUrls([]);
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось опубликовать пост',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Создать публикацию</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Фото или видео</Label>
            <div className="grid grid-cols-3 gap-2">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => removeMedia(index)}
                  >
                    <Icon name="X" size={14} />
                  </Button>
                </div>
              ))}
              
              {previewUrls.length < 10 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors flex items-center justify-center"
                >
                  <Icon name="Plus" size={32} className="text-muted-foreground" />
                </button>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption">Описание</Label>
            <Textarea
              id="caption"
              placeholder="Расскажите что-нибудь о вашем посте..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Место</Label>
            <Input
              id="location"
              placeholder="Добавьте геолокацию"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading || mediaFiles.length === 0}>
              {loading ? 'Публикация...' : 'Опубликовать'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
