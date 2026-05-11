from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRoleEnum(str, Enum):
    admin = "admin"
    pm = "pm"
    engineer = "engineer"
    viewer = "viewer"


class ProjectStatusEnum(str, Enum):
    draft = "draft"
    active = "active"
    on_hold = "on_hold"
    completed = "completed"


class TaskStatusEnum(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    review = "review"
    done = "done"


class DocumentStatusEnum(str, Enum):
    draft = "draft"
    review = "review"
    approved = "approved"


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str | None = None


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRoleEnum = UserRoleEnum.engineer


class UserCreate(UserBase):
    password: str = Field(min_length=6)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
    role: UserRoleEnum
    is_active: bool


class ProjectBase(BaseModel):
    name: str
    code: str
    description: str | None = None
    customer_name: str | None = None
    object_address: str | None = None
    status: ProjectStatusEnum = ProjectStatusEnum.draft
    start_date: date | None = None
    end_date: date | None = None
    manager_id: int | None = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    description: str | None = None
    customer_name: str | None = None
    object_address: str | None = None
    status: ProjectStatusEnum | None = None
    start_date: date | None = None
    end_date: date | None = None
    manager_id: int | None = None


class ProjectOut(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class ContractBase(BaseModel):
    number: str
    signed_date: date | None = None
    amount: float | None = None
    notes: str | None = None


class ContractCreate(ContractBase):
    pass


class ContractOut(ContractBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int


class PhaseBase(BaseModel):
    name: str
    sort_order: int = 0
    start_date: date | None = None
    end_date: date | None = None


class PhaseCreate(PhaseBase):
    pass


class PhaseOut(PhaseBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int


class TaskBase(BaseModel):
    title: str
    description: str | None = None
    status: TaskStatusEnum = TaskStatusEnum.todo
    priority: int = 1
    assignee_id: int | None = None
    phase_id: int | None = None
    due_date: date | None = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: TaskStatusEnum | None = None
    priority: int | None = None
    assignee_id: int | None = None
    phase_id: int | None = None
    due_date: date | None = None


class TaskOut(TaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime | None = None


class DocumentBase(BaseModel):
    title: str
    doc_type: str | None = None
    version: str = "1.0"
    status: DocumentStatusEnum = DocumentStatusEnum.draft


class DocumentCreate(DocumentBase):
    pass


class DocumentOut(DocumentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    file_path: str | None
    uploaded_by_id: int | None
    created_at: datetime


class TestRecordBase(BaseModel):
    name: str
    test_type: str | None = None
    location: str | None = None
    performed_at: date | None = None
    result_summary: str | None = None
    protocol_ref: str | None = None


class TestRecordCreate(TestRecordBase):
    pass


class TestRecordOut(TestRecordBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int


class DashboardStats(BaseModel):
    projects_total: int
    projects_active: int
    tasks_open: int
    tasks_overdue: int


class DashboardInsights(BaseModel):
    tasks_by_status: dict[str, int]
    projects_by_status: dict[str, int]
    documents_total: int
    tests_total: int


class RecentTaskOut(BaseModel):
    id: int
    title: str
    status: TaskStatusEnum
    project_id: int
    project_code: str
    project_name: str
    due_date: date | None
    updated_at: datetime | None
    assignee_name: str | None
