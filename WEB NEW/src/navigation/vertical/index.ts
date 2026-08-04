import type { UserInfo } from '@/composables/useAuth'

interface NavLeaf {
  title: string
  to: { path: string }
  icon?: { icon: string }
}

interface NavGroup {
  title: string
  icon: { icon: string }
  children: NavLeaf[]
}

const adminMenu: (NavLeaf | NavGroup)[] = [
  { title: 'Dashboard', icon: { icon: 'tabler-smart-home' }, to: { path: '/admin/dashboard' } },
  {
    title: 'Classes',
    icon: { icon: 'tabler-calendar-event' },
    children: [
      { title: 'Calendar', to: { path: '/admin/classes/calendar' } },
      { title: 'All Class Check', to: { path: '/admin/classes/all' } },
    ],
  },
  {
    title: 'Student',
    icon: { icon: 'tabler-school' },
    children: [
      { title: 'All Students', to: { path: '/admin/student/all' } },
      { title: 'New Admission', to: { path: '/admin/student/create' } },
      { title: 'Student Material', to: { path: '/admin/student/materials' } },
    ],
  },
  {
    title: 'Teacher',
    icon: { icon: 'tabler-user-bolt' },
    children: [
      { title: 'All Teacher', to: { path: '/admin/teacher/all' } },
      { title: 'New Teacher Register', to: { path: '/admin/teacher/create' } },
      { title: 'Teacher Material', to: { path: '/admin/teacher/materials' } },
    ],
  },
  { title: 'Users', icon: { icon: 'tabler-users' }, to: { path: '/admin/users' } },
  { title: 'Materials', icon: { icon: 'tabler-file' }, to: { path: '/admin/materials/all' } },
  { title: 'Library', icon: { icon: 'tabler-books' }, to: { path: '/admin/library' } },
  { title: 'Setting', icon: { icon: 'tabler-settings' }, to: { path: '/admin/setting' } },
]

const teacherMenu: (NavLeaf | NavGroup)[] = [
  { title: 'Classes', icon: { icon: 'tabler-calendar-event' }, to: { path: '/teacher/class' } },
  { title: 'Materials', icon: { icon: 'tabler-file' }, to: { path: '/teacher/materials' } },
]

const studentMenu: (NavLeaf | NavGroup)[] = [
  { title: 'Classes', icon: { icon: 'tabler-calendar-event' }, to: { path: '/student/class' } },
  { title: 'Materials', icon: { icon: 'tabler-file' }, to: { path: '/student/materials' } },
  { title: 'Library', icon: { icon: 'tabler-books' }, to: { path: '/student/library' } },
]

function filterByPermission(menu: (NavLeaf | NavGroup)[], userInfo: UserInfo) {
  const allowedLinks = userInfo.permissions?.map(it => it.link) || []

  return menu.reduce<(NavLeaf | NavGroup)[]>((acc, item) => {
    if ('children' in item) {
      const children = item.children.filter(child => allowedLinks.includes(child.to.path))

      if (children.length)
        acc.push({ ...item, children })
    }
    else if (allowedLinks.includes(item.to.path)) {
      acc.push(item)
    }

    return acc
  }, [])
}

export function getNavItems(userInfo: UserInfo | null | undefined) {
  if (!userInfo)
    return []

  if (['admin', 'superadmin'].includes(userInfo.role))
    return adminMenu

  if (userInfo.role === 'user')
    return filterByPermission(adminMenu, userInfo)

  if (userInfo.role === 'teacher')
    return teacherMenu

  if (userInfo.role === 'student')
    return studentMenu

  return []
}
