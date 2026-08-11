import { ref, computed, watch } from "vue";

export interface UserPermission {
  name: string;
  view: boolean;
  edit: boolean;
  delete: boolean;
  create: boolean;
}

export interface Permission {
  icon: string;
  name: string;
  link: string;
  view: boolean;
  edit?: boolean;
  delete?: boolean;
  create?: boolean;
  flagEdit: boolean;
  flagDelete: boolean;
  flagCreate: boolean;
}

export interface UserFormProps {
  editItems?: Record<string, unknown>;
  flagEdit?: boolean;
  userPermissions?: UserPermission[];
}

type UserFormEmit = (event: "input", value: Record<string, unknown>) => void;

const calulateAge = (dateOfBirth: string) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth() - birthDate.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export function useUserForm(props: UserFormProps, emit: UserFormEmit) {
  const date = ref(null);
  const menu = ref(false);
  const isSelectAll = ref(false);
  const age = ref(0);
  const showPassword = ref(false);

  const formInput = ref<Record<string, unknown>>({
    name: "",
    gender: "Male",
    dateOfBirth: "",
    username: "",
    password: "",
    duty: "",
    phone: "",
    address: "",
  });

  // 👉 Permission List
  const permissions = ref<Permission[]>([
    {
      icon: "tabler-dashboard",
      name: "Dashboard",
      link: "/admin/dashboard",
      view: true,
      edit: false,
      flagEdit: true,
      flagDelete: false,
      flagCreate: false,
    },
    {
      icon: "tabler-category",
      name: "Class Management",
      link: "/admin/classes/all",
      view: false,
      edit: false,
      create: false,
      flagEdit: true,
      flagDelete: true,
      flagCreate: true,
    },
    {
      icon: "tabler-category",
      name: "Teacher Fee For Class",
      link: "/admin/classes/fee",
      view: false,
      edit: false,
      create: false,
      flagEdit: true,
      flagDelete: true,
      flagCreate: true,
    },
    {
      icon: "tabler-calendar",
      name: "Class Calendar",
      link: "/admin/classes/calendar",
      view: false,
      edit: false,
      delete: false,
      create: false,
      flagEdit: true,
      flagDelete: true,
      flagCreate: true,
    },

    {
      icon: "tabler-calendar",
      name: "Check Class Attendance",
      link: "/admin/classes/attendance",
      view: false,
      edit: false,
      delete: false,
      create: false,
      flagEdit: true,
      flagDelete: true,
      flagCreate: true,
    },
    {
      icon: "tabler-users",
      name: "Student Management",
      link: "/admin/student/all",
      view: false,
      edit: false,
      delete: false,
      create: false,
      flagEdit: true,
      flagDelete: true,
      flagCreate: true,
    },

    {
      icon: "tabler-user-plus",
      name: "New Student addmission",
      link: "/admin/student/create",
      view: false,
      edit: false,
      delete: false,
      create: false,
      flagEdit: true,
      flagDelete: true,
      flagCreate: true,
    },
    {
      icon: "tabler-currency-dollar",
      name: "Student Fee Management",
      link: "/admin/student/fee",
      view: false,
      edit: false,
      delete: false,
      create: false,
      flagEdit: true,
      flagDelete: true,
      flagCreate: true,
    },
    {
      icon: "tabler-currency-dollar",
      name: "Student Point Management",
      link: "/admin/student/point",
      view: false,
      edit: false,
      delete: false,
      create: false,
      flagEdit: true,
      flagDelete: true,
      flagCreate: true,
    },

    {
      icon: "tabler-file-text",
      name: "Student Metrials Management",
      link: "/admin/student/materials",
      view: false,
      edit: false,
      create: false,
      flagEdit: true,
      flagDelete: true,
      flagCreate: true,
    },
    {
      icon: "tabler-users",
      name: "Teacher Management",
      link: "/admin/teacher/all",
      view: false,
      edit: false,
      delete: false,
      create: false,
      flagEdit: true,
      flagDelete: true,
      flagCreate: true,
    },
    {
      icon: "tabler-user-plus",
      name: "Teacher fee Management",
      link: "/admin/teacher/create",
      view: false,
      edit: false,
      flagEdit: true,
      flagDelete: true,
      flagCreate: true,
    },
    {
      icon: "tabler-file-text",
      name: "Teacher Metrials Management",
      link: "/admin/teacher/materials",
      view: false,
      edit: false,
      create: false,
      flagEdit: true,
      flagDelete: true,
      flagCreate: true,
    },
    {
      icon: "tabler-file-text",
      name: "Metrials Management",
      link: "/admin/materials",
      view: false,
      edit: false,
      delete: false,
      create: false,
      flagEdit: true,
      flagDelete: true,
      flagCreate: true,
    },
    {
      icon: "tabler-users",
      name: "Users Management",
      link: "/admin/users",
      view: false,
      edit: false,
      delete: false,
      create: false,
      flagEdit: true,
      flagDelete: true,
      flagCreate: true,
    },
    {
      icon: "tabler-building-warehouse",
      name: "Library Management",
      link: "/admin/library",
      view: false,
      edit: false,
      delete: false,
      create: false,
      flagEdit: true,
      flagDelete: true,
      flagCreate: true,
    },
    // {
    //   name: "Library Management",
    //   view: false,
    // },
    {
      icon: "tabler-settings",
      name: "Setting",
      link: "/admin/setting",
      view: false,
      edit: false,
      flagEdit: true,
      flagDelete: true,
      flagCreate: true,
    },
  ]);

  const isIndeterminate = computed(() => {
    return (
      permissions.value.filter(
        (permission) =>
          permission.view ||
          permission.edit ||
          permission.delete ||
          permission.create
      ).length > 0 && !isSelectAll.value
    );
  });

  watch(
    formInput,
    () => {
      emit("input", {
        ...formInput.value,
        permissions: permissions.value.filter(
          (permission) =>
            permission.view ||
            permission?.edit ||
            permission?.delete ||
            permission?.create
        ),
      });
    },
    { deep: true }
  );

  watch(
    permissions,
    () => {
      emit("input", {
        ...formInput.value,
        permissions: permissions.value.filter(
          (permission) =>
            permission.view ||
            permission?.edit ||
            permission?.delete ||
            permission?.create
        ),
      });
    },
    { deep: true }
  );

  watch(
    () => props.editItems,
    () => {
      if (props.editItems && Object.keys(props.editItems).length !== 0) {
        formInput.value = { ...props.editItems };
      }
    },
    { deep: true }
  );

  watch(
    () => (formInput.value as Record<string, unknown>).dateOfBirth,
    () => {
      if (formInput.value.dateOfBirth) {
        age.value = calulateAge(formInput.value.dateOfBirth as string);
      }
    }
  );

  watch(isSelectAll, (val) => {
    permissions.value.forEach((permission) => {
      permission.view = val;
      permission.edit = val;
      permission.delete = val;
      permission.create = val;
    });
  });

  watch(
    () => props.userPermissions,
    () => {
      if (!props.userPermissions?.length) return;
      permissions.value.forEach((permission) => {
        const userPermission = props.userPermissions?.find(
          (userPermission) => userPermission.name === permission.name
        );
        if (userPermission) {
          permission.view = userPermission.view;
          permission.edit = userPermission.edit;
          permission.delete = userPermission.delete;
          permission.create = userPermission.create;
        }
      });
      console.log("  this.permissions :>> ", permissions.value);
    },
    { deep: true }
  );

  return {
    date,
    menu,
    isSelectAll,
    age,
    showPassword,
    formInput,
    permissions,
    isIndeterminate,
  };
}
