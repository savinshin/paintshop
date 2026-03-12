using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using PaintShopBackEnd.Application.Commands.Categories;
using PaintShopBackEnd.Application.Interfaces;
using PaintShopBackEnd.WebApi.Models.Categories;
using Microsoft.AspNetCore.Authorization;

namespace PaintShopBackEnd.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _service;
        private readonly IMapper _mapper;

        public CategoriesController(ICategoryService service, IMapper mapper)
        {
            _service = service;
            _mapper = mapper;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryResponse>>> GetCategories()
        {
            var items = await _service.GetAllAsync();
            return Ok(_mapper.Map<IEnumerable<CategoryResponse>>(items));
        }

        [AllowAnonymous]
        [HttpGet("{id:int}", Name = "GetCategoryById")]
        public async Task<ActionResult<CategoryResponse>> GetCategoryById(int id)
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null) return NotFound();

            return Ok(_mapper.Map<CategoryResponse>(item));
        }

        [Authorize(Policy = "AdminOnly")]
        [HttpPost]
        public async Task<ActionResult<CategoryResponse>> CreateCategory(
            [FromBody] CreateCategoryRequest request)
        {
            var command = _mapper.Map<CreateCategoryCommand>(request);
            var created = await _service.CreateAsync(command);
            var dto = _mapper.Map<CategoryResponse>(created);

            return CreatedAtRoute("GetCategoryById", new { id = created.Id }, dto);
        }

        [Authorize(Policy = "AdminOnly")]
        [HttpPut("{id:int}")]
        public async Task<ActionResult<CategoryResponse>> UpdateCategory(
            int id,
            [FromBody] UpdateCategoryRequest request)
        {
            var command = _mapper.Map<UpdateCategoryCommand>(request);
            command.Id = id;

            var updated = await _service.UpdateAsync(id, command);
            if (updated == null) return NotFound();

            return Ok(_mapper.Map<CategoryResponse>(updated));
        }

        [Authorize(Policy = "AdminOnly")]
        [HttpDelete("{id:int}")]
        public async Task<ActionResult> DeleteCategory(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }

        [AllowAnonymous]
        [HttpGet("tree")]
        public async Task<ActionResult<IEnumerable<CategoryTreeNode>>> GetTree()
        {
            var all = (await _service.GetAllAsync()).ToList();

            var nodes = all.ToDictionary(
                c => c.Id,
                c => new CategoryTreeNode(
                    c.Id,
                    c.Name,
                    c.Slug,
                    c.ParentId,
                    c.SortOrder,
                    c.IsActive,
                    new List<CategoryTreeNode>()
                )
            );

            var roots = new List<CategoryTreeNode>();

            foreach (var c in all)
            {
                var node = nodes[c.Id];
                if (c.ParentId is null)
                {
                    roots.Add(node);
                }
                else if (nodes.TryGetValue(c.ParentId.Value, out var parent))
                {
                    parent.Children.Add(node);
                }
            }

            void SortChildren(List<CategoryTreeNode> list)
            {
                list.Sort((a, b) => a.SortOrder.CompareTo(b.SortOrder));
                foreach (var n in list)
                {
                    if (n.Children.Count > 0)
                        SortChildren(n.Children);
                }
            }

            SortChildren(roots);

            return Ok(roots);
        }
    }
}
