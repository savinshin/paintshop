using Microsoft.AspNetCore.Mvc;
using AutoMapper;
using PaintShopBackEnd.Application.Commands.Products;
using PaintShopBackEnd.Application.Interfaces;
using PaintShopBackEnd.WebApi.Models.Products;
using Microsoft.AspNetCore.Authorization;

namespace PaintShopBackEnd.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _service;
        private readonly IMapper _mapper;

        public ProductsController(IProductService service, IMapper mapper)
        {
            _service = service;
            _mapper = mapper;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductResponse>>> GetProducts(
            [FromQuery] int? categoryId,
            [FromQuery] bool includeDescendants = false)
        {
            var items = categoryId.HasValue
                ? await _service.GetByCategoryAsync(categoryId.Value, includeDescendants)
                : await _service.GetAllAsync();

            return Ok(_mapper.Map<IEnumerable<ProductResponse>>(items));
        }

        [AllowAnonymous]
        [HttpGet("{id}", Name = "GetProductById")]
        public async Task<ActionResult<ProductResponse>> GetProductById(string id)
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(_mapper.Map<ProductResponse>(item));
        }

        [Authorize(Policy = "AdminOnly")]
        [HttpPost]
        public async Task<ActionResult<ProductResponse>> CreateProduct([FromBody] CreateProductRequest request)
        {
            var command = _mapper.Map<CreateProductCommand>(request);
            var created = await _service.CreateAsync(command);
            var dto = _mapper.Map<ProductResponse>(created);
            return CreatedAtRoute("GetProductById", new { id = created.Id }, dto);
        }

        [Authorize(Policy = "AdminOnly")]
        [HttpPut("{id}")]
        public async Task<ActionResult<ProductResponse>> UpdateProduct(string id, [FromBody] UpdateProductRequest request)
        {
            var command = _mapper.Map<UpdateProductCommand>(request);
            command.Id = id; // из роутинга

            var updated = await _service.UpdateAsync(id, command);
            if (updated == null) return NotFound();

            return Ok(_mapper.Map<ProductResponse>(updated));
        }

        [Authorize(Policy = "AdminOnly")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteProduct(string id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}
