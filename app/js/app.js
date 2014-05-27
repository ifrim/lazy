(function() {
 	var app = {}, items = Lazy([]),	$list = $('#todo-list'), lastId = 0
	
	app.add = item => items = items.concat([item]);
	
	app.remove = item => (items = items.reject(item));
	
	app.getItem = itemId => items.where({id: itemId}).toArray()[0];
	
	app.render = () => {
		var cnt = items.reduce((prev, item, index) => {
			var classesDefinition = {completed: item.completed, editing: item.editing},
				classes = Lazy(classesDefinition).keys().filter(k => classesDefinition[k]).join(' ');
			
			return prev +
				`<li class="${classes}" data-id="${item.id}">` +
				`	<div class="view">` +
				`		<input class="toggle" type="checkbox" ${item.completed ? 'checked' : ''}>` +
				`		<label>${item.name}</label>` +
				`		<button class="destroy"></button>` +
				`	</div>` +
				`	<form><input class="edit" value="${item.name}"></form>` +
				`</li>`;
		}, '');
		
		$list.html(cnt);
	};
	
	app.eventCallback = function(callbackFn, afterRenderCallback) {
		return function(e) {
			var id = Number($(this).closest('li').data('id'));

			callbackFn(id, this, e);
			app.render();
			afterRenderCallback && afterRenderCallback(id);
		};
	};
	
	app.bindEvents = () => {
		$list.on('change', '.toggle', app.eventCallback((id) => {
			var item = app.getItem(id);
			
			item.completed = !item.completed;
		}));
		
		$list.on('click', '.destroy', app.eventCallback((id) => app.remove({id: id})));
		
		$list.on('dblclick', 'label', app.eventCallback(id => app.getItem(id).editing = true, id => $list.find(`[data-id=${id}]`).find('.edit').focus()));
		
		$list.on('submit', 'form', app.eventCallback((id, _this, e) => {
			var item = app.getItem(id);
			
			e.preventDefault();
			item.name = $(_this).find('.edit').val();
			item.editing = false;
		}));
		
		$list.on('blur', '.edit', function() { $(this).closest('form').submit(); });
	};
	
	var dump = () => console.log(items.toArray());
	
	app.add({id: lastId++, name: 'as', completed: true, editing: false});
	app.add({id: lastId++, name: 'qweqwe', completed: false, editing: false});
	
	app.bindEvents();
	app.render();
	
}());