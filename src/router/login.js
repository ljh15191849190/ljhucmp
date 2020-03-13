import Login from '@/components/Login'
import EmptyPage from '@/components/common/EmptyPage'

export default [
    {
        path: '/login',
        name: 'login',
        component: Login
    },
    {
        path: '/empty',
        name: 'empty',
        component: EmptyPage
    }
]
