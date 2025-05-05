package gl2.todolist.controller;

import gl2.todolist.model.Todo;
import gl2.todolist.repository.TodoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/todos")
public class TodoController {

    @Autowired
    private TodoRepository repository;

    @GetMapping
    public List<Todo> getAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Todo> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search")
    public List<Todo> search(@RequestParam String query) {
        return repository.findAll().stream()
                .filter(todo -> todo.getTitle().toLowerCase().contains(query.toLowerCase()) || 
                        todo.getDescription().toLowerCase().contains(query.toLowerCase()))
                .collect(Collectors.toList());
    }
    
    @GetMapping("/status")
    public List<Todo> filterByStatus(@RequestParam boolean completed) {
        return repository.findAll().stream()
                .filter(todo -> todo.isCompleted() == completed)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<Todo> create(@RequestBody Todo todo) {
        if (todo.getTitle() == null || todo.getDescription() == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(repository.save(todo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Todo> update(@PathVariable Long id, @RequestBody Todo updated) {
        return repository.findById(id).map(todo -> {
            todo.setTitle(updated.getTitle());
            todo.setDescription(updated.getDescription());
            return ResponseEntity.ok(repository.save(todo));
        }).orElse(ResponseEntity.notFound().build());
    }
    
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Todo> toggleCompletion(@PathVariable Long id) {
        return repository.findById(id).map(todo -> {
            todo.setCompleted(!todo.isCompleted());
            return ResponseEntity.ok(repository.save(todo));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
