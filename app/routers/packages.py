from fastapi import APIRouter

from app.models.package import TourPackage

router = APIRouter(prefix="/packages", tags=["packages"])


@router.get("/{package_id}")
async def getPackage(package_id: str):
    """Fetch a single package by ID — used by the 'View Package' redirect flow."""
    package = await TourPackage.find_one(TourPackage.package_id == package_id)
    if not package:
        return {"error": "Package not found"}
    data = package.model_dump(exclude={"embedding"})
    return data


@router.get("")
async def listPackages(limit: int = 20):
    """List packages (no semantic search) — useful for debugging / admin views."""
    packages = await TourPackage.find_all(limit=limit).to_list()
    return [p.model_dump(exclude={"embedding"}) for p in packages]
