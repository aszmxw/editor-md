# Controllers

- [简介](#introduction)
- [基础控制器](#basic-controllers)
    - [定义控制器](#defining-controllers)
    - [单行为控制器](#single-action-controllers)
- [控制器中间件](#controller-middleware)
- [资源型控制器](#resource-controllers)
    - [部分资源路由](#restful-partial-resource-routes)
    - [嵌套资源](#restful-nested-resources)
    - [命名资源路由](#restful-naming-resource-routes)
    - [命名资源路由参数](#restful-naming-resource-route-parameters)
    - [确定资源路由范围](#restful-scoping-resource-routes)
    - [自定义资源 URIs](#restful-localizing-resource-uris)
    - [补充资源控制器](#restful-supplementing-resource-controllers)
- [依赖注入 & 控制器](#dependency-injection-and-controllers)
- [路由缓存](#route-caching)

<a name="introduction"></a>
## 简介

为了替代在路由文件中以闭包形式定义的所有的请求处理逻辑，你可能想要使用控制类来组织这些行为。控制器能将相关的请求处理逻辑组成一个单独的类。控制器被存放在 `app/Http/Controllers` 目录。

<a name="basic-controllers"></a>
## 基础控制器

<a name="defining-controllers"></a>
### 定义控制器

下面是一个基础控制器类的例子。需要注意的是，该控制器继承了 `Laravel` 的基础控制器。该类控制器提供了一些便利的方法，比如  `middleware` 方法，该方法可以为控制器行为添加中间件：
```php
    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Models\User;

    class UserController extends Controller
    {
        /**
         * 显示指定用户的简介
         *
         * @param  int  $id
         * @return View
         */
        public function show($id)
        {
            return view('user.profile', ['user' => User::findOrFail($id)]);
        }
    }
```

你可以像这样定义一个指向控制器行为的路由：
```php
    use App\Http\Controllers\UserController;

    Route::get('user/{id}', [UserController::class, 'show']);
```

当一个请求与指定路由的 URI 匹配时， `UserController` 控制器中的 `show` 方法将会执行。路由参数也将会被传递给该方法。

> 技巧：控制器并不是 **必需** 继承基础类。如果控制器没有继承基础类，你将无法使用一些便捷的功能，比如 `middleware`，`validate`，和 `dispatch` 方法。


<a name="single-action-controllers"></a>
### 单行为控制器

如果你想要定义一个只处理单个行为的控制器，你可以在控制器中放置一个 `__invoke` 方法：
```php
    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Models\User;

    class ShowProfile extends Controller
    {
        /**
         * 显示指定用户的简介
         *
         * @param  int  $id
         * @return View
         */
        public function __invoke($id)
        {
            return view('user.profile', ['user' => User::findOrFail($id)]);
        }
    }
	```

当注册单个行为控制器的路由时不需要指名方法：
```php
    use App\Http\Controllers\ShowProfile;

    Route::get('user/{id}', ShowProfile::class);
	```

你可以通过 Artisan 命令工具里的 `make:controller` 命令中的 `--invokable` 选项来生成一个可调用的控制器
```shell
	php artisan make:controller ShowProfile --invokable
```

> 技巧：可以使用 [stub 定制](/docs/laravel/8.x/artisan#stub-customization) 自定义控制器模板

<a name="controller-middleware"></a>
## 控制器中间件

[中间件](/docs/laravel/8.x/middleware) 可以在路由文件中分配给控制器的路由：
```php
    Route::get('profile', [UserController::class, 'show'])->middleware('auth');
```

然而，在控制器的构造函数中指定中间件更为方便。使用控制器构造函数中的 `middleware` 方法，可以轻松地将中间件分配给控制器。你甚至可以将中间件限制为只在控制器中的某些方法生效：
```php
    class UserController extends Controller
    {
        /**
         * 实例化一个新的控制器实例
         *
         * @return void
         */
        public function __construct()
        {
            $this->middleware('auth');

            $this->middleware('log')->only('index');

            $this->middleware('subscribed')->except('store');
        }
    }
```

同时，控制器还允许你使用一个闭包来注册中间件。这为不定义整个中间件类的情况下为单个控制器定义中间件提供了一种便捷的方法：
```php
    $this->middleware(function ($request, $next) {
        // ...

        return $next($request);
    });
```
> 技巧：你可以将中间件分配给控制器操作的一个子集。然而，它可能表明你的控制器正在变得复杂。建议你将控制器拆分为多个较小的控制器。



<a name="resource-controllers"></a>
## 资源型控制器

Laravel 的资源路由通过单行代码即可将典型的「CURD (增删改查)」路由分配给控制器。例如，你希望创建一个控制器来处理保存 "照片" 应用的所有 HTTP 请求。使用 Artisan 命令 `make:controller` 可以快速创建这样一个控制器：
```php
    php artisan make:controller PhotoController --resource
```
这个命令将会生成一个控制器 `app/Http/Controllers/PhotoController.php`。 其中包括每个可用资源操作的方法。

接下来，你可以给控制器注册一个资源路由：
```php
    Route::resource('photos', PhotoController::class);
```
这个单一的路由声明创建了多个路由来处理资源上的各种行为。生成的控制器为每个行为保留了方法，包括了关于处理 HTTP 动词和 URLs 的声明注释。

你可以通过将数组传参到 `resources` 方法中的方式来一次性的创建多个资源控制器：
```php
    Route::resources([
        'photos' => PhotoController::class,
        'posts' => PostController::class,
    ]);
```
#### 资源控制器操作处理

Verb      | URI                  | Action       | Route Name
----------|-----------------------|--------------|---------------------
GET       | `/photos`              | index        | photos.index
GET       | `/photos/create`       | create       | photos.create
POST      | `/photos`              | store        | photos.store
GET       | `/photos/{photo}`      | show         | photos.show
GET       | `/photos/{photo}/edit` | edit         | photos.edit
PUT/PATCH | `/photos/{photo}`      | update       | photos.update
DELETE    | `/photos/{photo}`      | destroy      | photos.destroy

#### 指定资源模型

如果你使用了路由模型绑定，并且想在资源控制器的方法中使用类型提示，你可以在生成控制器的时候使用 `--model` 选项：
```shell
    php artisan make:controller PhotoController --resource --model=Photo
```


### 部分资源路由

当声明资源路由时，你可以指定控制器处理的部分行为，而不是所有默认的行为：

```php
    Route::resource('photos', PhotoController::class)->only([
        'index', 'show'
    ]);

    Route::resource('photos', PhotoController::class)->except([
        'create', 'store', 'update', 'destroy'
    ]);
```

#### API 资源路由

当声明用于 APIs 的资源路由时，通常需要排除显示 HTML 模板的路由（如 `create` 和 `edit` ）。为了方便起见，你可以使用 `apiResource` 方法自动排除这两个路由：

    Route::apiResource('photos', PhotoController::class);

你也可以传递一个数组给 `apiResources` 方法来同时注册多个 API 资源控制器：

    Route::apiResources([
        'photos' => PhotoController::class,
        'posts' => PostController::class,
    ]);

要快速生成不包含 `create` 或 `edit` 方法的用于开发接口的资源控制器，请在执行 make:controller 命令时使用 `--api` 参数:

    php artisan make:controller API/PhotoController --api

### 嵌套资源

有时可能需要定义一个嵌套的资源型路由。例如，照片资源可能被添加了多个评论。那么可以在路由中使用 “点” 符号来声明资源型控制器：

    Route::resource('photos.comments', PhotoCommentController::class);

该路由会注册一个嵌套资源，可以使用如下 `URI` 访问:

    /photos/{photo}/comments/{comment}

#### 限定嵌套资源的范围

Laravel 的 [隐式模型绑定](/docs/laravel/8.x/routing#implicit-model-binding-scoping) 特性可以自动限定嵌套绑定的范围，因此已解析的子模型会自动属于父模型。定义嵌套路由时，使用 `scoped` 方法，可以开启自动范围限定，也可以指定 Laravel 应该按照哪个字段检索子模型资源

    Route::resource('photos.comments', PhotoCommentController::class)->scoped([
        'comment' => 'slug',
    ]);



这个路由会注册一个限定范围的嵌套资源路由，可以像下面这样来访问：

    /photos/{photo}/comments/{comment:slug}

#### 浅层嵌套

通常，并不完全需要在 `URI` 中同时拥有父 ID 和子 ID ，因为子 ID 已经是唯一的标识符。当使用唯一标识符（如自动递增的主键）来标识 `URI` 中的模型时，可以选择使用「浅嵌套」的方式定义路由：

    Route::resource('photos.comments', CommentController::class)->shallow();

上面的路由定义方式会定义以下路由：

HTTP 方式 | URI                               | 行为         | 路由名称
----------|-----------------------------------|--------------|---------------------
GET       | `/photos/{photo}/comments`        | index        | photos.comments.index
GET       | `/photos/{photo}/comments/create` | create       | photos.comments.create
POST      | `/photos/{photo}/comments`        | store        | photos.comments.store
GET       | `/comments/{comment}`             | show         | comments.show
GET       | `/comments/{comment}/edit`        | edit         | comments.edit
PUT/PATCH | `/comments/{comment}`             | update       | comments.update
DELETE    | `/comments/{comment}`             | destroy      | comments.destroy

### 命名资源路由

默认情况下，所有的资源控制器行为都有一个路由名称。你可以传入 `names` 数组来覆盖这些名称：

    Route::resource('photos', PhotoController::class)->names([
        'create' => 'photos.build'
    ]);

### 命名资源路由参数

默认情况下，`Route::resource` 会根据资源名称的「单数」形式创建资源路由的路由参数。你可以在选项数组中传入 `parameters` 参数来轻松地覆盖每个资源。`parameters` 数组应该是资源名称和参数名称的关联数组：

    Route::resource('users', AdminUserController::class)->parameters([
        'users' => 'admin_user'
    ]);

 

上例将会为资源的 `show` 路由生成如下的 URI ：

    /users/{admin_user}

### 限定范围的资源路由

有时，在定义资源路由时隐式绑定了多个 Eloquent 模型，你希望限定第二个 Eloquent 模型必须为第一个 Eloquent 模型的子模型。例如，考虑这样一个场景，通过 slug 检索某个特殊用户的一篇文章：

    use App\Http\Controllers\PostsController;

    Route::resource('users.posts', PostsController::class)->scoped();

你可以通过给 `scoped` 方法传递一个数组来覆盖默认的模型路由键：

    use App\Http\Controllers\PostsController;

    Route::resource('users.posts', PostsController::class)->scoped([
        'post' => 'slug',
    ]);

当使用一个自定义键的隐式绑定作为嵌套路由参数时，Laravel 会自动限定查询范围，按照约定的命名方式去父类中查找关联方法，然后检索到对应的嵌套模型。在这种情况下，将假定 `User` 模型有一个叫 `posts`（路由参数名的复数）的关联方法，通过这个方法可以检索到 `Post` 模型。

### 自定义资源 URIs

默认情况下，`Route::resource` 将会用英文动词创建资源 URI。如果需要自定义 `create` 和 `edit` 行为的动作名，可以在 `AppServiceProvider` 的 `boot` 中使用 `Route::resourceVerbs` 方法实现:

    use Illuminate\Support\Facades\Route;

    /**
     * 引导任何应用服务。
     *
     * @return void
     */
    public function boot()
    {
        Route::resourceVerbs([
            'create' => 'crear',
            'edit' => 'editar',
        ]);
    }

动作被自定义后，像 `Route::resource('fotos', 'PhotoController')` 这样注册的资源路由将会产生如下的 URI：

    /fotos/crear

    /fotos/{foto}/editar



<a name="restful-supplementing-resource-controllers"></a>
### 补充资源控制器

如果您需要增加额外的路由到默认的资源路由之中，您需要在 `Route::resource` 前定义它们；否则， `resource` 方法定义的路由可能会无意间优先于您定义的路由：

    Route::get('photos/popular', [PhotoController::class, 'popular']);

    Route::resource('photos', PhotoController::class);

> 技巧：记得保持您的控制器的专一性。如果您需要典型的资源操作以外的方法，请考虑将您的控制器分割为两个更小的控制器。

<a name="dependency-injection-and-controllers"></a>
## 依赖注入 & 控制器

#### 构造注入

Laravel [服务容器](/docs/laravel/8.x/container) 被用于解析所有的 Laravel 控制器。因此，您可以在控制器的构造函数中使用类型提示需要的依赖项。声明的解析会自动解析并注入到控制器实例中去：

```php
    <?php

    namespace App\Http\Controllers;

    use App\Repositories\UserRepository;

    class UserController extends Controller
    {
        /**
         * 用户 repository 实例。
         */
        protected $users;

        /**
         * 创建一个新的控制器实例。
         *
         * @param  UserRepository  $users
         * @return void
         */
        public function __construct(UserRepository $users)
        {
            $this->users = $users;
        }
    }
```

您亦可类型提示 [Laravel 契约](/docs/laravel/8.x/contracts) ，只要它能够被解析。取决于您的应用，注入依赖到控制器可能会提供更好的可测试性。

#### 方法注入

除了构造器注入以外，您亦可在控制器方法中类型提示依赖。最常见的用法便是注入 `Illuminate\Http\Request` 到您的控制器方法中：

    <?php

    namespace App\Http\Controllers;

    use Illuminate\Http\Request;

    class UserController extends Controller
    {
        /**
         * 保存一个新用户。
         *
         * @param  Request  $request
         * @return Response
         */
        public function store(Request $request)
        {
            $name = $request->name;

            //
        }
    }



如果您的控制器方法要从路由参数中获取输入内容，请在您的依赖项之后列出您的路由参数。例如，您可以像下方这样定义路由：

    Route::put('user/{id}', [UserController::class, 'update']);

如下所示，您依然可以类型提示 `Illuminate\Http\Request` 并通过定义您的控制器方法访问 `id` 参数：

    <?php

    namespace App\Http\Controllers;

    use Illuminate\Http\Request;

    class UserController extends Controller
    {
        /**
         * 修改指定的用户。
         *
         * @param  Request  $request
         * @param  string  $id
         * @return Response
         */
        public function update(Request $request, $id)
        {
            //
        }
    }

<a name="route-caching"></a>
## 路由缓存

如果您的应用仅使用了基于路由的控制器，您应该充分利用 Laravel 路由缓存。使用路由缓存将会大幅降低您的应用路由的注册时间。有时，您的路由注册的速度可能会提高 100 倍。要生成路由缓存，仅需执行  `route:cache` Artisan 命令：

    php artisan route:cache

在运行该命令后，每次请求将会加载您缓存的路由文件。请记住，您每次添加新路由后均需要生成新的路由缓存。因此，您应该在项目部署时才运行 `route:cache` 命令。

您亦可使用 `route:clear` 来清除路由缓存：

    php artisan route:clear