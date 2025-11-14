'use client';

import { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  Alert,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useProblemStore } from '@/store/useProblemStore';
import type { ProblemType } from '@/types';

export default function AddPage() {
  const router = useRouter();
  const addProblem = useProblemStore((state) => state.addProblem);
  
  const [type, setType] = useState<ProblemType>('room');
  const [roomNumber, setRoomNumber] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 验证文件类型和大小
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('只能上传图片文件');
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('图片大小不能超过5MB');
        return false;
      }
      return true;
    });

    const newImageFiles = [...imageFiles, ...validFiles];
    setImageFiles(newImageFiles);
    
    // 预览图片
    const previewPromises = validFiles.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previewPromises).then((previews) => {
      setImages([...images, ...previews]);
    });

    setError('');
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newFiles = imageFiles.filter((_, i) => i !== index);
    setImages(newImages);
    setImageFiles(newFiles);
  };

  const uploadImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return [];

    const uploadPromises = imageFiles.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('上传失败');
      }

      const data = await response.json();
      return data.url;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async () => {
    // 房间问题需要房号，公共问题不需要
    if (type === 'room' && !roomNumber.trim()) {
      setError('请输入房号');
      return;
    }
    if (!description.trim()) {
      setError('请输入问题描述');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // 上传图片
      const uploadedUrls = await uploadImages();

      // 提交问题
      const response = await fetch('/api/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          roomNumber: type === 'room' ? roomNumber.trim() : '',
          description: description.trim(),
          notes: notes.trim(),
          images: uploadedUrls,
        }),
      });

      const data = await response.json();

      if (data.success) {
        addProblem(data.data);
        setSuccess(true);
        // 清空表单
        setType('room');
        setRoomNumber('');
        setDescription('');
        setNotes('');
        setImages([]);
        setImageFiles([]);
        
        // 2秒后跳转到查看页面
        setTimeout(() => {
          router.push('/view');
        }, 2000);
      } else {
        setError(data.message || '提交失败');
      }
    } catch (err) {
      setError('提交失败，请重试');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container 
      maxWidth="md" 
      sx={{ 
        py: { xs: 2, sm: 4 },
        px: { xs: 1, sm: 2 },
      }}
    >
      <Box 
        sx={{ 
          mb: 3, 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 1, sm: 2 },
        }}
      >
        <IconButton onClick={() => router.push('/')} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
        >
          添加验房问题
        </Typography>
      </Box>

      <Paper sx={{ p: { xs: 2, sm: 4 } }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            提交成功！正在跳转到查看页面...
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <FormControl>
            <FormLabel>问题类型</FormLabel>
            <RadioGroup
              row
              value={type}
              onChange={(e) => {
                const newType = e.target.value as ProblemType;
                setType(newType);
                if (newType === 'announcement') {
                  setRoomNumber(''); // 切换为公共问题时清空房号
                }
              }}
            >
              <FormControlLabel value="room" control={<Radio />} label="房间问题" />
              <FormControlLabel value="announcement" control={<Radio />} label="公共问题" />
            </RadioGroup>
          </FormControl>

          {type === 'room' && (
            <TextField
              label="房号"
              required
              fullWidth
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="例如：1-101"
            />
          )}

          <TextField
            label="问题描述"
            required
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="请详细描述发现的问题"
          />

          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              上传图片（可选，可上传多张）
            </Typography>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="image-upload"
              type="file"
              multiple
              onChange={handleImageSelect}
            />
            <label htmlFor="image-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<PhotoCameraIcon />}
              >
                选择图片
              </Button>
            </label>

            {images.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                {images.map((img, index) => (
                  <Box key={index} sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(33.333% - 16px)' } }}>
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        paddingTop: '75%', // 4:3 比例
                      }}
                    >
                      <Box
                        component="img"
                        src={img}
                        alt={`预览 ${index + 1}`}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: 1,
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => removeImage(index)}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'rgba(0,0,0,0.7)',
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <TextField
            label="备注"
            fullWidth
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="其他备注信息（可选）"
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => router.push('/')}
              disabled={loading}
            >
              取消
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
            >
              {loading ? '提交中...' : '提交'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

