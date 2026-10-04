import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import { AppBar, Box, Container, Stack, Toolbar, Typography } from '@mui/material'
import { Link, Outlet } from 'react-router-dom'

export function AppLayout() {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar elevation={0} position="static">
        <Toolbar>
          <Container maxWidth="lg" disableGutters>
            <Stack
              component={Link}
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: 'center',
                color: 'inherit',
                textDecoration: 'none',
                width: 'fit-content',
              }}
              to="/products"
            >
              <Inventory2OutlinedIcon />
              <Typography component="span" sx={{ fontWeight: 750 }} variant="h6">
                Product Hub
              </Typography>
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Outlet />
      </Container>
    </Box>
  )
}
