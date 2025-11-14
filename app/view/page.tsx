'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
  CalendarToday as CalendarTodayIcon,
  Home as HomeIcon,
  Description as DescriptionIcon,
  Note as NoteIcon,
  Close as CloseIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Announcement as AnnouncementIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useProblemStore } from '@/store/useProblemStore';
import type { ProblemLog, ProblemType } from '@/types';

export default function ViewPage() {
  const router = useRouter();
  const { problems, setProblems, filters, setFilters } = useProblemStore();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageList, setSelectedImageList] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // 加载问题列表
  const loadProblems = async (currentFilters = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFilters.type) {
        params.append('type', currentFilters.type);
      }
      if (currentFilters.roomNumber) {
        params.append('roomNumber', currentFilters.roomNumber);
      }
      if (currentFilters.startDate) {
        params.append('startDate', currentFilters.startDate);
      }
      if (currentFilters.endDate) {
        params.append('endDate', currentFilters.endDate);
      }

      const response = await fetch(`/api/problems?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setProblems(data.data);
      }
    } catch (error) {
      console.error('加载失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblems();
  }, []);

  // 筛选条件改变时自动触发搜索
  const prevFiltersRef = useRef(filters);
  useEffect(() => {
    // 检查筛选条件是否真的改变了
    const filtersChanged = 
      prevFiltersRef.current.type !== filters.type ||
      prevFiltersRef.current.roomNumber !== filters.roomNumber ||
      prevFiltersRef.current.startDate !== filters.startDate ||
      prevFiltersRef.current.endDate !== filters.endDate;

    if (!filtersChanged) return;

    prevFiltersRef.current = filters;

    // 类型筛选立即触发，房号和日期搜索添加防抖
    const delay = filters.type ? 0 : 500;
    const timer = setTimeout(() => {
      loadProblems(filters);
    }, delay);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.type, filters.roomNumber, filters.startDate, filters.endDate]);

  const handleSearch = () => {
    loadProblems();
  };

  const handleReset = () => {
    setFilters({
      type: '',
      roomNumber: '',
      startDate: '',
      endDate: '',
    });
    setTimeout(() => {
      loadProblems();
    }, 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: { xs: 2, sm: 4 },
        px: { xs: 1, sm: 2 },
      }}
    >
      <Box 
        sx={{ 
          mb: 3, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
        >
          验房问题列表
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/add')}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          添加问题
        </Button>
      </Box>

      {/* 搜索和筛选 */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* 问题类型筛选 */}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              问题类型
            </Typography>
            <ToggleButtonGroup
              value={filters.type || ''}
              exclusive
              onChange={(_, value) => {
                setFilters({ type: value || '' });
              }}
              aria-label="问题类型"
              fullWidth
              sx={{
                '& .MuiToggleButton-root': {
                  flex: 1,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                },
              }}
            >
              <ToggleButton value="" aria-label="全部">
                全部
              </ToggleButton>
              <ToggleButton value="room" aria-label="房间问题">
                房间问题
              </ToggleButton>
              <ToggleButton value="announcement" aria-label="公共问题">
                公共问题
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box 
            sx={{ 
              display: 'flex', 
              gap: { xs: 1, sm: 2 }, 
              alignItems: { xs: 'stretch', sm: 'center' },
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            <TextField
              label="房号搜索"
              value={filters.roomNumber}
              onChange={(e) => setFilters({ roomNumber: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              placeholder="输入房号进行搜索"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1 }}
              fullWidth
            />
            <Box 
              sx={{ 
                display: 'flex', 
                gap: { xs: 1, sm: 2 },
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{ flex: { xs: 1, sm: 'none' } }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  筛选
                </Box>
              </Button>
              <Button 
                variant="contained" 
                onClick={handleSearch} 
                disabled={loading}
                sx={{ flex: { xs: 1, sm: 'none' } }}
              >
                搜索
              </Button>
              <Button 
                variant="outlined" 
                onClick={handleReset}
                sx={{ flex: { xs: 1, sm: 'none' } }}
              >
                重置
              </Button>
            </Box>
          </Box>

          {showFilters && (
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 2, 
                pt: 2, 
                borderTop: '1px solid', 
                borderColor: 'divider',
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              <TextField
                label="开始日期"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon />
                    </InputAdornment>
                  ),
                }}
                fullWidth
                sx={{ flex: 1 }}
              />
              <TextField
                label="结束日期"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon />
                    </InputAdornment>
                  ),
                }}
                fullWidth
                sx={{ flex: 1 }}
              />
            </Box>
          )}
        </Box>
      </Paper>

      {/* 问题列表 */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>加载中...</Typography>
        </Box>
      ) : problems.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            暂无问题记录
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/add')}
            sx={{ mt: 2 }}
          >
            添加第一条记录
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {problems.map((problem) => (
            <Grid item xs={12} sm={6} md={4} key={problem.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  {problem.images.length > 0 && (
                  <Box
                    component="div"
                    sx={{
                      position: 'relative',
                      width: '100%',
                      paddingTop: '56.25%', // 16:9 比例
                      height: 0, // 配合paddingTop创建高度
                      overflow: 'hidden',
                      backgroundColor: 'grey.200',
                      display: 'block',
                      flexShrink: 0,
                    }}
                  >
                    <Box
                      component="img"
                      src={problem.images[0]}
                      alt={(problem.type === 'room' && problem.roomNumber) ? problem.roomNumber : '公共问题'}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        cursor: 'pointer',
                        display: 'block',
                      }}
                      onError={(e: any) => {
                        console.error('图片加载失败:', problem.images[0], e);
                      }}
                      onClick={() => {
                        setSelectedImageList(problem.images);
                        setSelectedImageIndex(0);
                        setSelectedImage(problem.images[0]);
                      }}
                    />
                  </Box>
                )}
                <CardContent 
                  sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    p: { xs: 1.5, sm: 2 },
                  }}
                >
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: { xs: 0.5, sm: 1 }, 
                      mb: 1, 
                      flexWrap: 'wrap' 
                    }}
                  >
                    {/* 问题类型标签 */}
                    <Chip
                      label={(problem.type || 'room') === 'room' ? '房间问题' : '公共问题'}
                      size="small"
                      color={(problem.type || 'room') === 'room' ? 'primary' : 'secondary'}
                      icon={(problem.type || 'room') === 'room' ? <HomeIcon /> : <AnnouncementIcon />}
                      sx={{ mr: 'auto', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                    />
                    {/* 房间问题显示房号 */}
                    {(problem.type || 'room') === 'room' && problem.roomNumber && (
                      <>
                        <HomeIcon fontSize="small" color="action" sx={{ fontSize: { xs: 16, sm: 20 } }} />
                        <Typography 
                          variant="h6" 
                          component="div"
                          sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                        >
                          {problem.roomNumber}
                        </Typography>
                      </>
                    )}
                    {/* 图片数量标签 */}
                    {problem.images.length > 1 && (
                      <Chip
                        label={`${problem.images.length}张`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      />
                    )}
                  </Box>

                  <Box sx={{ mb: 2, flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'start', gap: 1, mb: 1 }}>
                      <DescriptionIcon fontSize="small" color="action" sx={{ mt: 0.5, fontSize: { xs: 16, sm: 18 } }} />
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        {problem.description}
                      </Typography>
                    </Box>

                    {problem.notes && (
                      <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                        <NoteIcon fontSize="small" color="action" sx={{ mt: 0.5, fontSize: { xs: 16, sm: 18 } }} />
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          {problem.notes}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto' }}>
                    <CalendarTodayIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(problem.createdAt)}
                    </Typography>
                  </Box>

                  {problem.images.length > 1 && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {problem.images.slice(1, 4).map((img, index) => (
                        <Box
                          key={index}
                          component="img"
                          src={img}
                          alt={`${(problem.type || 'room') === 'room' && problem.roomNumber ? problem.roomNumber : '公共问题'} ${index + 2}`}
                          sx={{
                            width: 60,
                            height: 60,
                            objectFit: 'cover',
                            borderRadius: 1,
                            cursor: 'pointer',
                          }}
                          onError={(e: any) => {
                            console.error('图片加载失败:', img, e);
                          }}
                          onClick={() => {
                            setSelectedImageList(problem.images);
                            setSelectedImageIndex(index + 1);
                            setSelectedImage(img);
                          }}
                        />
                      ))}
                      {problem.images.length > 4 && (
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'grey.200',
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="caption">
                            +{problem.images.length - 4}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* 图片预览对话框 */}
      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>
              图片预览 ({selectedImageIndex + 1} / {selectedImageList.length})
            </Typography>
            <IconButton onClick={() => setSelectedImage(null)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedImage && (
            <Box sx={{ position: 'relative', width: '100%' }}>
              {selectedImageList.length > 1 && (
                <>
                  <IconButton
                    onClick={() => {
                      const prevIndex = selectedImageIndex > 0 
                        ? selectedImageIndex - 1 
                        : selectedImageList.length - 1;
                      setSelectedImageIndex(prevIndex);
                      setSelectedImage(selectedImageList[prevIndex]);
                    }}
                    sx={{
                      position: 'absolute',
                      left: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(0,0,0,0.7)',
                      },
                    }}
                  >
                    <ChevronLeftIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      const nextIndex = selectedImageIndex < selectedImageList.length - 1
                        ? selectedImageIndex + 1
                        : 0;
                      setSelectedImageIndex(nextIndex);
                      setSelectedImage(selectedImageList[nextIndex]);
                    }}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(0,0,0,0.7)',
                      },
                    }}
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </>
              )}
              <Box
                component="img"
                src={selectedImage}
                alt="预览"
                sx={{ width: '100%', height: 'auto', display: 'block' }}
                onError={(e: any) => {
                  console.error('图片预览加载失败:', selectedImage, e);
                }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}

