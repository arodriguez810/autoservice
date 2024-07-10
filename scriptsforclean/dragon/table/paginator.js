PAGINATOR = {
    run: function ($scope, off) {
        if (off) {
            eval(`CRUD_${$scope.modelName}`).table = {};
            eval(`CRUD_${$scope.modelName}`).table = {
                limits: [5, 10, 50, 100, 0]
            };
            $scope.table = {
                records: [],
                loading: false,
                loaded: false,
                is: {
                    loading: true
                },
                orderby: "id",
                order: "asc"
            };

            $scope.stopInteraction = function () {
                return false;
            };
        }
        $scope.getLimits = function () {
            var limits = eval(`CRUD_${$scope.modelName}`).table.limits || [10, 50, 100, 0];
            if (limits.length === 0)
                return [10];
            else return limits;
        };
        $scope.table.currentPage = 1;
        $scope.table.currentLimit = $scope.getLimits()[0];
        $scope.table.pages = [];
        $scope.table.totalPags = 0;
        $scope.table.totalCount = 0;
        $scope.table.currentCount = 0;
        $scope.goLimit = function (limit) {
            if ($scope.stopInteraction()) return false;
            if ($scope.table.currentLimit !== limit) {
                $scope.table.currentLimit = limit;
                $scope.table.currentPage = 1;
                STORAGE.savePage($scope);
                if ($scope.characterist('persist'))
                    $scope.saveModel('limit', "table.currentLimit");
                $scope.pageChanged();
            } else {
                $scope.pageNotChanged();
            }
        };
        $scope.limitActive = function (limit) {
            return $scope.table.currentLimit === limit ? String.format("bg-{0}-300", COLOR.secundary) : '';
        };
        $scope.pageChanged = function () {
            STORAGE.savePage($scope);
            if (!$scope.offline)
                $scope.refresh();
        };
        $scope.pageNotChanged = function () {

        };
        $scope.offlineVisible = function (key) {
            return key >= ($scope.table.currentLimit * ($scope.table.currentPage - 1))
                && key < ($scope.table.currentLimit * ($scope.table.currentPage));
        };
        $scope.nextPage = function () {
            if ($scope.stopInteraction()) return false;
            if ($scope.table.currentPage < $scope.table.totalPages) {
                $scope.table.currentPage++;
                $scope.pageChanged();
            } else {
                $scope.pageNotChanged();
            }
        };
        $scope.pageKey = function (key) {
            if (key === "ArrowLeft")
                $scope.backPage();
            if (key === "ArrowRight")
                $scope.nextPage();
        };
        $scope.backPage = function () {
            if ($scope.stopInteraction()) return false;
            if ($scope.table.currentPage > 1) {
                $scope.table.currentPage--;
                $scope.pageChanged();
            } else {
                $scope.pageNotChanged();
            }
        };
        $scope.lastPage = function () {
            if ($scope.stopInteraction()) return false;
            if ($scope.table.currentPage !== $scope.table.totalPages) {
                $scope.table.currentPage = $scope.table.totalPages;
                $scope.pageChanged();
            } else {
                $scope.pageNotChanged();
            }
        };
        $scope.isFirstPage = function () {
            return $scope.table.currentPage === 1;
        };
        $scope.isLastPage = function () {
            return $scope.table.currentPage === $scope.table.totalPages;
        };
        $scope.firstPage = function () {
            if ($scope.stopInteraction()) return false;
            if ($scope.table.currentPage !== 1) {
                $scope.table.currentPage = 1;
                $scope.pageChanged();
            } else {
                $scope.pageNotChanged();
            }
        };
        $scope.goPageModal = function () {
            SWEETALERT.goPage($scope);
        };
        $scope.goPage = function (page) {
            if ($scope.stopInteraction()) return false;
            if (page < $scope.table.totalPages + 1) {
                if ($scope.table.currentPage !== page) {
                    $scope.table.currentPage = page;
                    $scope.pageChanged();
                } else {
                    $scope.pageNotChanged();
                }
            }
        };
    },
    make: function ($scope, data) {
        $scope.records = {};
        delete $scope.records;
        $scope.records = data;
        $scope.table.totalPages = data.totalPage;
        $scope.table.totalCount = data.totalCount;
        $scope.table.currentCount = parseInt(data.count);
        $scope.table.pages = [];
        var paginartorRagen = 10;
        var halfOfRange = Math.ceil(paginartorRagen / 2);
        var initPaginator = $scope.table.currentPage - halfOfRange;
        initPaginator = initPaginator <= 0 ? 1 : initPaginator;
        initPaginator = initPaginator > (data.totalPage - paginartorRagen) ? (data.totalPage - paginartorRagen) : initPaginator;
        initPaginator = initPaginator <= 0 ? 1 : initPaginator;
        var lastPaginator = $scope.table.currentPage + halfOfRange;
        lastPaginator = lastPaginator < paginartorRagen ? paginartorRagen : lastPaginator;
        lastPaginator = lastPaginator > data.totalPage ? data.totalPage : lastPaginator;
        for (var i = initPaginator; i <= lastPaginator; i++) {
            $scope.table.pages.push({
                number: i,
                current: $scope.table.currentPage === i ? ("active bg-" + COLOR.secundary) : "",
                class: ""
            });
        }
        $scope.checkall = false;
    },
    makeoffline: function ($scope, data) {
        $scope.records = {};
        delete $scope.records;
        $scope.offline = true;
        if ($scope.filtreameoff) {
            data = data.filtro($scope.filtreameoff);
        }
        $scope.records = data;
        data.totalPage = Math.ceil(data.length / $scope.table.currentLimit);
        data.totalCount = data.length;
        $scope.table.totalPages = data.totalPage;
        $scope.table.totalCount = data.totalCount;
        $scope.table.currentCount = $scope.table.currentLimit;
        $scope.table.pages = [];
        var paginartorRagen = 10;
        var halfOfRange = Math.ceil(paginartorRagen / 2);
        var initPaginator = $scope.table.currentPage - halfOfRange;
        initPaginator = initPaginator <= 0 ? 1 : initPaginator;
        initPaginator = initPaginator > (data.totalPage - paginartorRagen) ? (data.totalPage - paginartorRagen) : initPaginator;
        initPaginator = initPaginator <= 0 ? 1 : initPaginator;
        var lastPaginator = $scope.table.currentPage + halfOfRange;
        lastPaginator = lastPaginator < paginartorRagen ? paginartorRagen : lastPaginator;
        lastPaginator = lastPaginator > data.totalPage ? data.totalPage : lastPaginator;
        for (var i = initPaginator; i <= lastPaginator; i++) {
            $scope.table.pages.push({
                number: i,
                current: $scope.table.currentPage === i ? ("active bg-" + COLOR.secundary) : "",
                class: ""
            });
        }
        $scope.checkall = false;
    }
};
