import logging
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncEngine, async_sessionmaker, AsyncSession
from sqlalchemy import select, func
from Back.models.base import Base
from Back.models.admin_model import Administrator
from Back.models.category_model import Category
from Back.models.product_model import Product
from Back.models.product_image_model import ProductImage
from Back.core.security import hash_password

logger = logging.getLogger(__name__)

async def seed_initial_data(engine: AsyncEngine) -> None:
    """Creates initial database tables, default administrator, categories, and products if empty."""
    session_factory = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    async with session_factory() as session:
        # 1. Seed Administrator if not exists
        admin_count_q = select(func.count(Administrator.admin_id))
        admin_count_res = await session.execute(admin_count_q)
        admin_count = admin_count_res.scalar_one()

        if admin_count == 0:
            default_admin = Administrator(
                name="Administrador Aura",
                email="admin@auracosmeticos.com.br",
                password_hash=hash_password("Admin123!"),
                role="SuperAdmin"
            )
            session.add(default_admin)
            # Also add admin@auracosmeticos.com for compatibility with placeholder in frontend
            alt_admin = Administrator(
                name="Admin Aura",
                email="admin@auracosmeticos.com",
                password_hash=hash_password("Admin123!"),
                role="SuperAdmin"
            )
            session.add(alt_admin)
            await session.commit()
            logger.info("Default administrators created (admin@auracosmeticos.com.br / Admin123!).")

        # 2. Seed Categories if not exists
        cat_count_q = select(func.count(Category.category_id))
        cat_count_res = await session.execute(cat_count_q)
        cat_count = cat_count_res.scalar_one()

        category_map = {}
        if cat_count == 0:
            categories_to_seed = [
                Category(name="Maquiagem", slug="maquiagem"),
                Category(name="Skincare", slug="skincare"),
                Category(name="Perfumaria", slug="perfumaria"),
                Category(name="Cabelos", slug="cabelos"),
                Category(name="Corpo & Banho", slug="corpo-e-banho")
            ]
            session.add_all(categories_to_seed)
            await session.commit()
            for cat in categories_to_seed:
                category_map[cat.slug] = cat.category_id
            logger.info("Default cosmetic categories created.")
        else:
            cat_list = (await session.execute(select(Category))).scalars().all()
            for cat in cat_list:
                category_map[cat.slug] = cat.category_id

        # 3. Seed Products if not exists
        prod_count_q = select(func.count(Product.product_id))
        prod_count_res = await session.execute(prod_count_q)
        prod_count = prod_count_res.scalar_one()

        if prod_count == 0:
            products_to_seed = [
                (
                    Product(
                        name="Batom Matte Longa Duração Velvet Red",
                        slug="batom-matte-longa-duracao-velvet-red",
                        brand="Aura Glow",
                        category_id=category_map.get("maquiagem"),
                        description="Batom líquido de alta pigmentação com acabamento aveludado e hidratação com Vitamina E.",
                        ingredients="Dimethicone, Isododecane, Tocopherol (Vitamina E), Ácido Hialurônico, Pigmentos Minerais.",
                        price=Decimal("49.90"),
                        stock_quantity=35,
                        is_active=True
                    ),
                    "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80"
                ),
                (
                    Product(
                        name="Sérum Facial Antioxidante Vitamina C 15%",
                        slug="serum-facial-antioxidante-vitamina-c-15",
                        brand="Aura Derm",
                        category_id=category_map.get("skincare"),
                        description="Sérum clareador e iluminador com 15% de Vitamina C estabilizada e Ácido Ferúlico.",
                        ingredients="Ascorbic Acid 15%, Ferulic Acid 0.5%, Hyaluronic Acid, Aqua, Propanediol.",
                        price=Decimal("89.90"),
                        stock_quantity=25,
                        is_active=True
                    ),
                    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80"
                ),
                (
                    Product(
                        name="Eau de Parfum Floral Sublime 100ml",
                        slug="eau-de-parfum-floral-sublime-100ml",
                        brand="Aura Fragrances",
                        category_id=category_map.get("perfumaria"),
                        description="Fragrância marcante com notas de saída de bergamota, coração de jasmim sambac e fundo de baunilha de Madagascar.",
                        ingredients="Alcohol Denat, Parfum, Aqua, Benzyl Salicylate, Linalool, Hydroxycitronellal.",
                        price=Decimal("189.90"),
                        stock_quantity=15,
                        is_active=True
                    ),
                    "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&auto=format&fit=crop&q=80"
                ),
                (
                    Product(
                        name="Máscara Capilar Nutrição Intensa Óleo de Argan",
                        slug="mascara-capilar-nutricao-intensa-oleo-de-argan",
                        brand="Aura Hair",
                        category_id=category_map.get("cabelos"),
                        description="Tratamento profundo para cabelos secos e quebradiços, enriquecido com óleo de argan e queratina vegetal.",
                        ingredients="Cetearyl Alcohol, Argania Spinosa Kernel Oil, Hydrolyzed Keratin, Behentrimonium Chloride.",
                        price=Decimal("59.90"),
                        stock_quantity=40,
                        is_active=True
                    ),
                    "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600&auto=format&fit=crop&q=80"
                ),
                (
                    Product(
                        name="Hidratante Corporal Manteiga de Karité e Iluminador",
                        slug="hidratante-corporal-manteiga-de-karite",
                        brand="Aura Body",
                        category_id=category_map.get("corpo-e-banho"),
                        description="Manteiga corporal ultra-hidratante com partículas iluminadoras sutis e toque acetinado.",
                        ingredients="Butyrospermum Parkii (Shea) Butter, Mica, Prunus Amygdalus Dulcis Oil, Glycerin.",
                        price=Decimal("45.00"),
                        stock_quantity=3,  # Critical stock for testing inventory warnings
                        is_active=True
                    ),
                    "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80"
                ),
                (
                    Product(
                        name="Base Líquida Acabamento Natural Alta Cobertura",
                        slug="base-liquida-acabamento-natural-alta-cobertura",
                        brand="Aura Glow",
                        category_id=category_map.get("maquiagem"),
                        description="Base líquida resistente ao suor e transferência, com ácido hialurônico e proteção FPS 30.",
                        ingredients="Aqua, Cyclopentasiloxane, Titanium Dioxide, Ethylhexyl Methoxycinnamate, Niacinamide.",
                        price=Decimal("79.90"),
                        stock_quantity=20,
                        is_active=True
                    ),
                    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80"
                )
            ]

            for prod, img_url in products_to_seed:
                session.add(prod)
                await session.flush()
                image = ProductImage(
                    product_id=prod.product_id,
                    image_url=img_url,
                    is_primary=True,
                    display_order=1
                )
                session.add(image)

            await session.commit()
            logger.info("Default cosmetics catalog seeded successfully.")
