from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from Back.core.config import settings

# Master Engine (Write)
write_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=20,
    max_overflow=10,
)

# Read Engine (Replica or Fallback to Master)
read_engine = create_async_engine(
    settings.DATABASE_READ_URL or settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=30,
    max_overflow=15,
)

AsyncWriteSessionFactory = async_sessionmaker(
    bind=write_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

AsyncReadSessionFactory = async_sessionmaker(
    bind=read_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provides a transactional database session for write operations."""
    async with AsyncWriteSessionFactory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise

async def get_read_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provides a read-only database session pointing to replica or master."""
    async with AsyncReadSessionFactory() as session:
        yield session
