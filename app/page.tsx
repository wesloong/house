'use client';

import { Container, Paper, Button, Typography, Box } from '@mui/material';
import {
  Add as AddIcon,
  List as ListIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import Link from 'next/link';

export default function Home() {
  return (
    <Container 
      maxWidth="sm" 
      sx={{ 
        py: { xs: 4, sm: 8 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <Paper sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
        <Box sx={{ mb: 4 }}>
          <HomeIcon sx={{ fontSize: { xs: 48, sm: 60 }, color: 'primary.main', mb: 2 }} />
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{ fontSize: { xs: '1.75rem', sm: '2rem' } }}
          >
            小区验房问题统计
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            统一管理和查看验房问题
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <Button
            component={Link}
            href="/add"
            variant="contained"
            fullWidth
            size="large"
            startIcon={<AddIcon />}
            sx={{ py: 1.5 }}
          >
            添加验房问题
          </Button>
          <Button
            component={Link}
            href="/view"
            variant="outlined"
            fullWidth
            size="large"
            startIcon={<ListIcon />}
            sx={{ py: 1.5 }}
          >
            查看问题列表
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
