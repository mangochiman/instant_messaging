var express = require('express');
var router = express.Router();
var model = require('../models/instantMessage');
var knex = require('../config/bookshelf').knex;
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var loadUser = require('../force_login');
var Promise = require('bluebird');
var fs = require('fs');
var mkdirp = require('mkdirp');
var getDirName = require('path').dirname;
var multer = require('multer');
var upload = multer({dest: '/tmp'});
var uploadPath = 'ViewerJS/uploads';
var fse = require('fs-extra');


User = model.User;
Group = model.Group;
ChatDetails = model.ChatDetails;
GroupMemberShip = model.GroupMemberShip;

/* GET home page. */
router.get('/', /*loadUser,*/ function (req, res, next) {
    res.redirect('/index');
});

router.get('/index', loadUser, function (req, res, next) {
    var user = req.user.toJSON();
    date = new Date();
    year = date.getFullYear();
    month = date.getMonth() + 1
    day = date.getDate();
    todays_date = year + '_' + month + '_' + day;

    constitutionPath = uploadPath + '/constitution';
    standingOrdersPath = uploadPath + '/standing_orders';
    unknownCategoryPath = uploadPath + '/unknown_category';

    constitution = '';
    standingOrder = '';
    unknownCategory = '';

    if (fs.existsSync(constitutionPath)) {
        files = getFiles(constitutionPath);
        if (files.length > 0) {
            constitution = files[files.length - 1];
        }
    }

    if (fs.existsSync(standingOrdersPath)) {
        files = getFiles(standingOrdersPath);
        if (files.length > 0) {
            standingOrder = files[files.length - 1];
        }
    }

    if (fs.existsSync(unknownCategoryPath)) {
        files = getFiles(unknownCategoryPath);
        if (files.length > 0) {
            unknownCategory = files[files.length - 1];
        }
    }

    uploadedFiles = {constitution: constitution, standingOrder: standingOrder, unknownCategory: unknownCategory};
    console.log(uploadedFiles);

    knex('group_membership').where({user_id: user.user_id}).then(function (group_membership) {
        knex('group').where({group_id: group_membership[0].group_id}).then(function (g) {
            group_color = g[0].color;
            knex('group').then(function (groups) {
                var promises = groups.map(function (group) {
                    group_id = group.group_id;
                    return knex('group_membership').where({group_id: group_id}).count("user_id as user_id")
                            .then(function (user_count) {
                                group['members_count'] = user_count[0]["user_id"];
                                return group;
                            })
                })

                var promises2 = groups.map(function (group) {
                    group_id = group.group_id;
                    return knex('user').join('group_membership', 'user.user_id', '=', 'group_membership.user_id').where({group_id: group_id}).then(function (users) {
                        group['group_members'] = users;
                        return group
                    })
                })

                return Promise.all(promises2)
            }).then(function (data) {
                res.render('index', {groups: data, user: user, group_color: group_color, uploaded_files: uploadedFiles});
            });
        })

    })

});

router.get('/sign_in', function (req, res, next) {
    if (req.isAuthenticated())
        res.redirect('/');


    res.render('sign_in', {title: 'Sign In'});
});

router.post('/process_authentication', function (req, res, next) {
    passport.authenticate('local', {successRedirect: '/',
        failureRedirect: '/sign_in'}, function (err, user, info) {
        if (err) {
            return res.render('sign_in', {title: 'Sign In', errorMessage: err.message});
        }

        if (!user) {
            return res.render('sign_in', {title: 'Sign In', errorMessage: info.message});
        }
        return req.logIn(user, function (err) {
            if (err) {
                return res.render('sign_in', {title: 'Sign In', errorMessage: err.message});
            } else {
                return res.redirect('/index');
            }
        });
    })(req, res, next);
});

router.get('/sign_out', function (req, res, next) {
    if (!req.isAuthenticated()) {
        notFound404(req, res, next);
    } else {
        req.logout();
        res.redirect('/sign_in');
    }
});

router.get('/add_group', function (req, res, next) {

    knex('group').then(function (groups) {
        var promises = groups.map(function (group) {
            group_id = group.group_id;
            return knex('group_membership').where({group_id: group_id}).count("user_id as user_id")
                    .then(function (user_count) {
                        group['members_count'] = user_count[0]["user_id"];
                        return group;
                    })
        })

        var promises2 = groups.map(function (group) {
            group_id = group.group_id;
            return knex('user').join('group_membership', 'user.user_id', '=', 'group_membership.user_id').where({group_id: group_id}).then(function (users) {
                group['group_members'] = users;
                return group
            })
        })

        return Promise.all(promises2)
    }).then(function (data) {
        res.render('add_group', {groups: data});
    });

});

router.post('/create_group', function (req, res, next) {
    console.log(req.body)
    group_name = req.body.group_name;
    group_color = req.body.group_color;
    group_description = req.body.group_description; //Add group_description later;

    new Group({
        name: group_name,
        color: group_color
    }).save().then(function (group) {
        res.redirect("/add_group");
    })

});

router.get('/delete_group', function (req, res, next) {
    //groups_main = new model.Group().fetchAll();
    new model.Group().fetchAll().then(function (groups_main) {
        groups_main = JSON.stringify(groups_main);
        knex('group').then(function (groups) {
            var promises = groups.map(function (group) {
                group_id = group.group_id;
                return knex('group_membership').where({group_id: group_id}).count("user_id as user_id")
                        .then(function (user_count) {
                            group['members_count'] = user_count[0]["user_id"];
                            return group;
                        })
            })

            var promises2 = groups.map(function (group) {
                group_id = group.group_id;
                return knex('user').join('group_membership', 'user.user_id', '=', 'group_membership.user_id').where({group_id: group_id}).then(function (users) {
                    group['group_members'] = users;
                    return group
                })
            })

            return Promise.all(promises2)
        }).then(function (data) {
            res.render('delete_group', {groups: data, groups_main: JSON.parse(groups_main)});
        })
    })
            ;

});

router.post('/process_delete_group', function (req, res, next) {
    group_id = req.body.group_id;
    console.log(group_id);
    knex('group').where('group_id', '=', group_id).del().then(function (group) {
        knex('group_membership').where('group_id', '=', group_id).del().then(function (group_membership) {
            res.redirect("/delete_group");
        })

    });
})


router.get('/add_member', function (req, res, next) {

    knex('group').then(function (groups) {
        var promises = groups.map(function (group) {
            group_id = group.group_id;
            return knex('group_membership').where({group_id: group_id}).count("user_id as user_id")
                    .then(function (user_count) {
                        group['members_count'] = user_count[0]["user_id"];
                        return group;
                    })
        })

        var promises2 = groups.map(function (group) {
            group_id = group.group_id;
            return knex('user').join('group_membership', 'user.user_id', '=', 'group_membership.user_id').where({group_id: group_id}).then(function (users) {
                group['group_members'] = users;
                return group
            })
        })

        return Promise.all(promises2)
    }).then(function (data) {
        res.render('add_member', {groups: data});
    });
});

router.get('/delete_member', function (req, res, next) {
    new model.User().fetchAll().then(function (users) {
        users = JSON.stringify(users);
        knex('group').then(function (groups) {
            var promises = groups.map(function (group) {
                group_id = group.group_id;
                return knex('group_membership').where({group_id: group_id}).count("user_id as user_id")
                        .then(function (user_count) {
                            group['members_count'] = user_count[0]["user_id"];
                            return group;
                        })
            })

            var promises2 = groups.map(function (group) {
                group_id = group.group_id;
                return knex('user').join('group_membership', 'user.user_id', '=', 'group_membership.user_id').where({group_id: group_id}).then(function (users) {
                    group['group_members'] = users;
                    return group
                })
            })

            return Promise.all(promises2)
        }).then(function (data) {
            res.render('delete_member', {groups: data, users: JSON.parse(users)});
        });
    })
});

router.post('/process_delete_member', function (req, res, next) {
    user_id = req.body.user_id;
    console.log()
    knex('user').where('user_id', '=', user_id).del().then(function (user) {
        knex('group_membership').where('user_id', '=', user_id).del().then(function (group_membership) {
            res.redirect("/delete_member");
        })
    });
})

function groupMembers(groupID) {

    return knex('user').join('group_membership', 'user.user_id', '=', 'group_membership.user_id').where({group_id: groupID}).then(function (users) {
        return (users);
    })

}

router.post('/create_member', function (req, res, next) {
    var password = req.body.password;
    var password_hash = bcrypt.hashSync(password);
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var username = req.body.username;
    var group_id = req.body.group_id;

    new User({
        fname: first_name,
        lname: last_name,
        username: username,
        password: password_hash
    }).save().then(function (user) {
        user_id = user.id;
        new GroupMemberShip({
            group_id: group_id,
            user_id: user_id,
        }).save().then(function (group_member_ship) {
            res.redirect('/add_member');
        });
    });
});

router.get('/upload_documents', loadUser, function (req, res, next) {
    var user = req.user.toJSON();
    document_types = [
        ['Constitution', 'constitution'],
        ['Standing Orders', 'standing_orders'],
        ['Unknown Category', 'unknown_category']
    ]
    knex('group_membership').where({user_id: user.user_id}).then(function (group_membership) {
        knex('group').where({group_id: group_membership[0].group_id}).then(function (g) {
            group_color = g[0].color;
            knex('group').then(function (groups) {
                var promises = groups.map(function (group) {
                    group_id = group.group_id;
                    return knex('group_membership').where({group_id: group_id}).count("user_id as user_id")
                            .then(function (user_count) {
                                group['members_count'] = user_count[0]["user_id"];
                                return group;
                            })
                })

                var promises2 = groups.map(function (group) {
                    group_id = group.group_id;
                    return knex('user').join('group_membership', 'user.user_id', '=', 'group_membership.user_id').where({group_id: group_id}).then(function (users) {
                        group['group_members'] = users;
                        return group
                    })
                })

                return Promise.all(promises2)
            }).then(function (data) {
                res.render('upload_documents', {groups: data, user: user, group_color: group_color, document_types: document_types});
            });
        })

    })

});

router.post('/process_upload_documents', upload.single('file'), function (req, res, next) {
    document_type = req.body.document_type;
    if (req.file) {
        filePath = req.file.path;
        fileName = req.file.filename;
        mimetype = req.file.mimetype;
        console.log(mimetype)
        documentPathUploads = uploadPath + '/' + document_type;
        console.log(uploadPath)
        newPath = documentPathUploads + '/' + fileName;

        if (!fs.existsSync(documentPathUploads)) {
            fs.mkdirSync(documentPathUploads);
        }

        fse.copy(filePath, newPath, function (err) {
            if (err) {
                return console.error(err);
            } else {
                console.log("success!")
                res.redirect('/upload_documents');
            }
        });

    } else {
        res.redirect('/upload_documents');
    }
})

router.get('/delete_documents', loadUser, function (req, res, next) {
    var user = req.user.toJSON();

    constitutionPath = uploadPath + '/constitution';
    standingOrdersPath = uploadPath + '/standing_orders';
    unknownCategoryPath = uploadPath + '/unknown_category';

    constitutionFiles = [];
    standingOrderFiles = [];
    unknownCategoryFiles = [];

    if (fs.existsSync(constitutionPath)) {
        constitutionFiles = getFiles(constitutionPath);
    }

    if (fs.existsSync(standingOrdersPath)) {
        standingOrderFiles = getFiles(standingOrdersPath);
    }

    if (fs.existsSync(unknownCategoryPath)) {
        unknownCategoryFiles = getFiles(unknownCategoryPath);
    }

    files = {constitution_files: constitutionFiles, standing_order_files: standingOrderFiles, unknown_category_files: unknownCategoryFiles}

    knex('group_membership').where({user_id: user.user_id}).then(function (group_membership) {
        knex('group').where({group_id: group_membership[0].group_id}).then(function (g) {
            group_color = g[0].color;
            knex('group').then(function (groups) {
                var promises = groups.map(function (group) {
                    group_id = group.group_id;
                    return knex('group_membership').where({group_id: group_id}).count("user_id as user_id")
                            .then(function (user_count) {
                                group['members_count'] = user_count[0]["user_id"];
                                return group;
                            })
                })

                var promises2 = groups.map(function (group) {
                    group_id = group.group_id;
                    return knex('user').join('group_membership', 'user.user_id', '=', 'group_membership.user_id').where({group_id: group_id}).then(function (users) {
                        group['group_members'] = users;
                        return group
                    })
                })

                return Promise.all(promises2)
            }).then(function (data) {
                res.render('delete_documents', {groups: data, user: user, group_color: group_color, files: files});
            });
        })

    })

});

router.post('/process_delete_documents', loadUser, function (req, res, next) {
    file_name = req.body.file_name;
    document_type = req.body.document_type;
    
    constitutionPath = uploadPath + '/constitution';
    standingOrdersPath = uploadPath + '/standing_orders';
    unknownCategoryPath = uploadPath + '/unknown_category';

    if (document_type === 'constitution') {
        filePath = constitutionPath + '/' + file_name;
    }

    if (document_type === 'standing_orders') {
        filePath = standingOrdersPath + '/' + file_name;
    }

    if (document_type === 'unknown_category') {
        filePath = unknownCategoryPath + '/' + file_name;
    }

    fs.unlinkSync(filePath);
    res.redirect('/delete_documents');
})

function getFiles(dir, files_) {
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files) {
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, files_);
        } else {
            //files_.push(name);
            files_.push(files[i]);
        }
    }
    return files_;
}

module.exports = function (io) {
    var app = require('express');
    var router = app.Router();

    io.on('connection', function (socket) {
        console.log('Connection from Index')
    });

    return router;
}

module.exports = router;
