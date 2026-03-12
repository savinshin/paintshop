using AutoMapper;
using PaintShopBackEnd.Application.Commands.Categories;
using PaintShopBackEnd.Application.Interfaces;
using PaintShopBackEnd.Domain.Entities;
using PaintShopBackEnd.Domain.Interfaces;

namespace PaintShopBackEnd.Application.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _repo;
        private readonly IMapper _mapper;

        public CategoryService(ICategoryRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        public Task<IEnumerable<Category>> GetAllAsync() => _repo.GetAllAsync();

        public Task<Category?> GetByIdAsync(int id) => _repo.GetByIdAsync(id);

        public async Task<Category> CreateAsync(CreateCategoryCommand command)
        {
            if (string.IsNullOrWhiteSpace(command.Name))
                throw new ArgumentException("Name is required");

            command.Slug = NormalizeSlug(command.Name, command.Slug);

            var entity = _mapper.Map<Category>(command);
            return await _repo.CreateAsync(entity);
        }

        public async Task<Category?> UpdateAsync(int id, UpdateCategoryCommand command)
        {
            if (id != command.Id)
                throw new ArgumentException("Route id must match body id");

            var existing = await _repo.GetByIdAsync(id);
            if (existing == null) return null;

            if (string.IsNullOrWhiteSpace(command.Name))
                throw new ArgumentException("Name is required");

            command.Slug = NormalizeSlug(command.Name, command.Slug);

            _mapper.Map(command, existing);
            return await _repo.UpdateAsync(existing);
        }

        public async Task DeleteAsync(int id)
        {
            await _repo.DeleteAsync(id);
        }

        private static string NormalizeSlug(string name, string? slug)
        {
            var value = string.IsNullOrWhiteSpace(slug) ? name : slug;
            return value.Trim()
                        .ToLowerInvariant()
                        .Replace(' ', '-');
        }
    }
}
