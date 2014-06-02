(function() {
    'use strict';
	var app = {}, items = Lazy([]),	$list = $('#todo-list'), lastId = 0, status = 'all';
	
	/**
	 * Adds a todo
	 * 
	 * @param {string} todoName - the name of the todo
	 */
	app.add = todoName => items = items.concat([{
			id: lastId++,
			name: todoName,
			completed: false,
			editing: false
	}]);
	
	/**
	 * Removes an item from the todos
	 * 
	 * @param {object} item - the todo item object
	 */
	app.remove = itemId => items = items.reject({id: itemId});
	
	/**
	 * Gets a todo based on it's id
	 * 
	 * @param {integer} itemId - the id of the todo
	 * @return {object}
	 */
	app.getItem = itemId => items.where({id: itemId}).toArray()[0];
	
	/**
	 * Changes the status of the todolist to 'all', 'active', or 'completed'
	 * @param {string} newStatus - the new status
	 */
	app.changeStatus = newStatus => status = newStatus;
	
	/**
	 * Renders the UI
	 */
	app.render = () => {
		var displayItems = Lazy(items.toArray());
		
		switch(status) {
			case 'active': displayItems = displayItems.where({completed: false}); break;
			case 'completed': displayItems = displayItems.where({completed: true}); break;
		}
		
		// render the list
		let cnt = displayItems.reduce((prev, item, index) => {
			var classesDefinition = {
					completed: item.completed, 
					editing: item.editing
				},
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
		
		// render the remaining uncompleted items
		let remaining = items.filter({completed: false}).size();
		$('#todo-count strong').html(`${remaining} item${remaining === 1 ? '' : 's'} left`);
		
		// render the 'clear completed' thing
		let completedCount = items.filter({completed: true}).size();
		$('#clear-completed')[completedCount ? 'show' : 'hide']().find('span').text(completedCount);
		
		// set 'toggle-all' state
		$('#toggle-all').prop('checked', displayItems.where({completed: true}).size() === items.size());
		
		// set status
		$('#filters').find('a').removeClass('selected').filter(`[data-status="${status}"]`).addClass('selected');
	};
	
	/**
	 * Helper function used in the binding of the events on the todos from the list.
	 * It returns a function that will be invoked when the event is triggered.
	 * It automatically gets the id of the todo and passes it to the first callback.
	 * After the first callback call it renders the UI.
	 * It optionally calls another callback after the render call.
	 * 
	 * @param {function} callbackFn - the first callback
	 * @param {function} afterRenderCallback - the optional callback that gets called last (after the UI rendering)
	 * @return {function}
	 */
	app.eventCallback = function(callbackFn, afterRenderCallback) {
		return function(e) {
			var id = Number($(this).closest('li').data('id'));

			callbackFn(id, this, e);
			app.render();
			afterRenderCallback && afterRenderCallback(id);
		};
	};
	
	/**
	 * Binds the applications events
	 */
	app.bindEvents = () => {
		$list.on('change', '.toggle', app.eventCallback(id => {
			var item = app.getItem(id);
			
			item.completed = !item.completed;
		}));
		
		$list.on('click', '.destroy', app.eventCallback(id => app.remove(id)));
		
		$list.on('dblclick', 'label', app.eventCallback(id => app.getItem(id).editing = true, id => $list.find(`[data-id=${id}]`).find('.edit').focus()));
		
		$list.on('submit', 'form', app.eventCallback((id, _this, e) => {
			var item = app.getItem(id);
			
			e.preventDefault();
			item.name = $(_this).find('.edit').val();
			item.editing = false;
		}));
		
		$list.on('blur', '.edit', function() { $(this).closest('form').submit(); });
		
		// toggle all
		$('#toggle-all').on('change', function() {
			var _this = this;
			items = Lazy(items.toArray().map(i => (i.completed = _this.checked, i)));
			app.render();
		});
		
		// new todo
		$('#todo-form').on('submit', function(e) {
			e.preventDefault();
			app.add($('#new-todo').val());
			$('#new-todo').val('');
			app.render();
		});
		
		// clear completed
		$('#clear-completed').on('click', function() {
			items.where({completed: true}).pluck('id').each(itemId => app.remove(itemId));
			app.render();
		});
		
		// change status
		$('#filters').on('click', 'a', function(e) {
			e.preventDefault();
			app.changeStatus($(this).data('status'));
			console.log($(this).data('status'), '::', status);
			app.render();
		});
	};
	
	app.add('buy groceries');
	app.add('finish todo project');
	
	app.bindEvents();
	app.render();
	
}());